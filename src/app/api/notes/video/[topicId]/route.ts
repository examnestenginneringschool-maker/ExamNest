import { NextResponse, type NextRequest } from "next/server";
import {
  createServerSupabaseClient,
  getAuthenticatedUser,
} from "@/lib/supabase/server";
import { verifyAndConsumeDrmTicket } from "@/lib/notes/drm-ticket";
import {
  buildCanonicalR2VideoPath,
  fetchPrivateStudyFile,
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

  const videoBytes =
    (await fetchPrivateStudyFile("videos-bucket", videoPath)) ||
    (await fetchPrivateStudyFile(
      (topicRow.pdf_storage_bucket as string | null) || "notes-bucket",
      videoPath
    ));

  if (!videoBytes) {
    return NextResponse.json(
      { error: "No video lecture uploaded for this topic yet." },
      { status: 404 }
    );
  }

  return new NextResponse(new Uint8Array(videoBytes), {
    status: 200,
    headers: {
      "Content-Type": "video/mp4",
      "Content-Disposition": "inline",
      "Cache-Control": "private, no-store, no-cache, must-revalidate",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
