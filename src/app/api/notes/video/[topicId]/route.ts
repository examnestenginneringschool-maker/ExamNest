import { NextResponse, type NextRequest } from "next/server";
import {
  createServerSupabaseClient,
  getAuthenticatedUser,
} from "@/lib/supabase/server";
import { verifyAndConsumeDrmTicket } from "@/lib/notes/drm-ticket";
import {
  isHlsManifestPath,
  isSafeHlsSegmentName,
  resolveHlsSegmentPath,
  rewriteHlsManifestSegments,
} from "@/lib/notes/hls-manifest";
import {
  buildCanonicalR2VideoPath,
  fetchPrivateStudyStream,
} from "@/lib/notes/r2-storage";

/**
 * Strictly non-shareable and non-downloadable Video Lecture Stream Gatekeeper.
 * Blocks direct browser address-bar access, external download managers, and shared links.
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ topicId: string }> }
) {
  const { topicId } = await context.params;
  const ticket = request.nextUrl.searchParams.get("ticket");

  // 1. Block direct browser navigation or copy-pasted URLs (only allow <video> element or fetch player)
  const secFetchDest = request.headers.get("sec-fetch-dest");
  const secFetchMode = request.headers.get("sec-fetch-mode");
  const customPlayerHeader = request.headers.get("x-qoncepto-player");

  if (
    secFetchMode === "navigate" ||
    (secFetchDest &&
      secFetchDest !== "video" &&
      secFetchDest !== "empty" &&
      customPlayerHeader !== "1")
  ) {
    return NextResponse.json(
      {
        error:
          "Direct video URL access and downloading are strictly blocked by Qoncepto DRM.",
      },
      { status: 403 }
    );
  }

  // 2. Require authenticated student JWT session
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 3. Enforce Single-Device Session Lock
  const browserDeviceToken =
    request.cookies.get("qoncepto_device_token")?.value || "";
  const activeDeviceToken =
    typeof user.rawUser.user_metadata?.active_device_token === "string"
      ? user.rawUser.user_metadata.active_device_token
      : "";

  if (
    activeDeviceToken &&
    (!browserDeviceToken || activeDeviceToken !== browserDeviceToken)
  ) {
    return NextResponse.json(
      { error: "Session replaced on another device." },
      { status: 403 }
    );
  }

  const effectiveDeviceToken =
    browserDeviceToken || activeDeviceToken || "session-bound";

  // 4. Verify device-bound HMAC ticket
  const verification = verifyAndConsumeDrmTicket({
    ticket,
    expectedUserId: user.id,
    expectedDeviceToken: effectiveDeviceToken,
    expectedTopicId: topicId,
    expectedIntent: "video",
    consumeNonce: false, // Allow byte-range requests during active 120s window on the same device
  });

  if (!verification.valid) {
    return NextResponse.json(
      { error: verification.reason || "Invalid video ticket." },
      { status: 403 }
    );
  }

  const supabase = await createServerSupabaseClient();
  const { data: topicRow } = await supabase
    .from("subject_note_topics")
    .select("*")
    .eq("id", topicId)
    .eq("is_active", true)
    .maybeSingle();

  if (!topicRow) {
    return NextResponse.json(
      { error: "Requested topic was not found." },
      { status: 404 }
    );
  }

  let videoPath = topicRow.video_storage_path as string | null;

  if (!videoPath) {
    const { data: unitRow } = await supabase
      .from("subject_note_units")
      .select("id, subject_id, unit_number, title")
      .eq("id", topicRow.note_unit_id)
      .maybeSingle();

    const subjectId =
      (topicRow.subject_id as string | null) || unitRow?.subject_id;

    const { data: subjectRow } = subjectId
      ? await supabase
          .from("subjects")
          .select("id, code")
          .eq("id", subjectId)
          .maybeSingle()
      : { data: null };

    const { data: currRow } = subjectId
      ? await supabase
          .from("curriculum_subjects")
          .select("university_id")
          .eq("subject_id", subjectId)
          .limit(1)
          .maybeSingle()
      : { data: null };

    const { data: uniRow } = currRow?.university_id
      ? await supabase
          .from("universities")
          .select("short_name, name")
          .eq("id", currRow.university_id)
          .maybeSingle()
      : { data: null };

    videoPath = buildCanonicalR2VideoPath({
      universityShortName: uniRow?.short_name || uniRow?.name || "makaut",
      subjectCode: subjectRow?.code || "subject",
      unitNumber: unitRow?.unit_number ?? 1,
      unitTitle: unitRow?.title || "module",
      topicNumber: topicRow.topic_number || "1.1",
      topicTitle: topicRow.title || "lecture",
    });
  }

  const fallbackBucket =
    (topicRow.pdf_storage_bucket as string | null) || "notes-bucket";

  // 5. Adaptive HLS delivery (.m3u8 manifest & .ts/.m4s/.key segments)
  if (isHlsManifestPath(videoPath)) {
    const segmentParam = request.nextUrl.searchParams.get("segment");

    if (segmentParam !== null) {
      if (!isSafeHlsSegmentName(segmentParam)) {
        return NextResponse.json(
          { error: "Invalid HLS segment." },
          { status: 400 }
        );
      }

      const segmentPath = resolveHlsSegmentPath(videoPath, segmentParam);
      const segmentContentType = segmentParam.endsWith(".ts")
        ? "video/mp2t"
        : segmentParam.endsWith(".m4s")
          ? "video/iso.segment"
          : "application/octet-stream";

      const segmentHeaders: Record<string, string> = {
        "Content-Type": segmentContentType,
        "Cache-Control": "private, no-store, no-cache, must-revalidate",
        "X-Content-Type-Options": "nosniff",
      };

      const edgeCache = (
        globalThis as unknown as { caches?: { default?: Cache } }
      ).caches?.default;
      const cacheKey = new Request(
        `https://r2-cache.qoncepto.internal/hls/${encodeURIComponent(segmentPath)}`,
        { method: "GET" }
      );

      if (edgeCache) {
        const cachedSegment = await edgeCache
          .match(cacheKey)
          .catch(() => undefined);
        if (cachedSegment && cachedSegment.body) {
          const cachedLen = cachedSegment.headers.get("content-length");
          if (cachedLen) {
            segmentHeaders["Content-Length"] = cachedLen;
          }
          return new NextResponse(cachedSegment.body, {
            status: 200,
            headers: segmentHeaders,
          });
        }
      }

      const segmentStream =
        (await fetchPrivateStudyStream("videos-bucket", segmentPath)) ||
        (await fetchPrivateStudyStream(fallbackBucket, segmentPath));

      if (!segmentStream) {
        return NextResponse.json(
          { error: "Requested video segment was not found." },
          { status: 404 }
        );
      }

      if (segmentStream.contentLength) {
        segmentHeaders["Content-Length"] = segmentStream.contentLength;
      }

      if (edgeCache && segmentStream.status === 200) {
        const [clientBody, cacheBody] = segmentStream.body.tee();
        const cacheHeaders: Record<string, string> = {
          "Content-Type": segmentContentType,
          "Cache-Control": "public, max-age=2592000, immutable",
        };
        if (segmentStream.contentLength) {
          cacheHeaders["Content-Length"] = segmentStream.contentLength;
        }
        void edgeCache
          .put(
            cacheKey,
            new Response(cacheBody, { status: 200, headers: cacheHeaders })
          )
          .catch(() => {});

        return new NextResponse(clientBody, {
          status: 200,
          headers: segmentHeaders,
        });
      }

      return new NextResponse(segmentStream.body, {
        status: 200,
        headers: segmentHeaders,
      });
    }

    const manifestStream =
      (await fetchPrivateStudyStream("videos-bucket", videoPath)) ||
      (await fetchPrivateStudyStream(fallbackBucket, videoPath));

    if (!manifestStream) {
      return NextResponse.json(
        { error: "No HLS playlist uploaded for this topic yet." },
        { status: 404 }
      );
    }

    const rawManifest = await new Response(manifestStream.body).text();
    const rewrittenManifest = rewriteHlsManifestSegments(
      rawManifest,
      topicId,
      ticket || ""
    );

    return new NextResponse(rewrittenManifest, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.apple.mpegurl",
        "Cache-Control": "private, no-store, no-cache, must-revalidate",
        "X-Content-Type-Options": "nosniff",
      },
    });
  }

  // 6. Standard MP4 Range / 206 Partial Content streaming
  const rangeHeader = request.headers.get("range");
  const videoStream =
    (await fetchPrivateStudyStream("videos-bucket", videoPath, rangeHeader)) ||
    (await fetchPrivateStudyStream(fallbackBucket, videoPath, rangeHeader));

  if (!videoStream) {
    return NextResponse.json(
      { error: "No video lecture uploaded for this topic yet." },
      { status: 404 }
    );
  }

  const headers: Record<string, string> = {
    "Content-Type": videoStream.contentType || "video/mp4",
    "Content-Disposition": "inline",
    "Accept-Ranges": videoStream.acceptRanges || "bytes",
    "Cache-Control": "private, no-store, no-cache, must-revalidate",
    "X-Content-Type-Options": "nosniff",
  };
  if (videoStream.contentLength) {
    headers["Content-Length"] = videoStream.contentLength;
  }
  if (videoStream.contentRange) {
    headers["Content-Range"] = videoStream.contentRange;
  }
  if (videoStream.etag) {
    headers["ETag"] = videoStream.etag;
  }

  return new NextResponse(videoStream.body, {
    status: videoStream.status === 206 ? 206 : 200,
    headers,
  });
}
