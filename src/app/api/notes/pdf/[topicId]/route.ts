import { NextResponse, type NextRequest } from "next/server";
import {
  createServerSupabaseClient,
  getAuthenticatedUser,
} from "@/lib/supabase/server";
import {
  verifyAndConsumeDrmTicket,
  type DrmMediaIntent,
} from "@/lib/notes/drm-ticket";
import {
  buildCanonicalR2NotePath,
  fetchPrivateStudyFile,
} from "@/lib/notes/r2-storage";
import {
  generateWatermarkedTopicPdf,
  stampWatermarkOnEveryPage,
  type CompiledNoteItem,
  type StudentWatermarkInfo,
} from "@/lib/notes/pdf-watermarker";

function buildBlockedHtmlResponse(message: string, status = 403) {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Access Blocked · Qoncepto Security</title>
  <style>
    body { margin: 0; font-family: system-ui, -apple-system, sans-serif; background: #0f172a; color: #f8fafc; display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 24px; }
    .card { max-width: 460px; background: #1e293b; border: 1px solid #334155; border-radius: 20px; padding: 32px; text-align: center; box-shadow: 0 20px 50px rgba(0,0,0,0.4); }
    .badge { display: inline-block; background: rgba(244,63,94,0.15); color: #fb7185; border: 1px solid rgba(244,63,94,0.3); font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; padding: 6px 12px; border-radius: 999px; margin-bottom: 16px; }
    h1 { font-size: 20px; margin: 0 0 10px; color: #ffffff; }
    p { font-size: 14px; line-height: 1.6; color: #94a3b8; margin: 0; }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">Qoncepto DRM Protection</div>
    <h1>Direct Link Sharing Blocked</h1>
    <p>${message}</p>
  </div>
</body>
</html>`;

  return new NextResponse(html, {
    status,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "private, no-store, no-cache, must-revalidate",
    },
  });
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ topicId: string }> }
) {
  const { topicId } = await context.params;
  const { searchParams } = request.nextUrl;
  const rawIntent = searchParams.get("intent");
  const ticket = searchParams.get("ticket");

  const intent: DrmMediaIntent =
    rawIntent === "download" ? "download" : "view";

  // 1. Block copy-pasted view links opened directly in a browser tab (must come from X-Qoncepto-Viewer fetch)
  const viewerHeader = request.headers.get("x-qoncepto-viewer");
  if (intent === "view" && viewerHeader !== "1") {
    return buildBlockedHtmlResponse(
      "This protected study document URL cannot be copy-pasted or opened outside the Qoncepto Notes Reader.",
      403
    );
  }

  // 2. Require authenticated student JWT session
  const user = await getAuthenticatedUser();
  if (!user) {
    return buildBlockedHtmlResponse(
      "You must be signed in to your Qoncepto student account to access this study material.",
      401
    );
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
    return buildBlockedHtmlResponse(
      "Your session on this device has expired because your account was signed in on another device.",
      403
    );
  }

  const effectiveDeviceToken =
    browserDeviceToken || activeDeviceToken || "session-bound";

  // 4. Verify & burn the one-time HMAC-SHA256 DRM ticket
  const verification = verifyAndConsumeDrmTicket({
    ticket,
    expectedUserId: user.id,
    expectedDeviceToken: effectiveDeviceToken,
    expectedTopicId: topicId,
    expectedIntent: intent,
    consumeNonce: true,
  });

  if (!verification.valid) {
    return buildBlockedHtmlResponse(
      verification.reason ||
        "This one-time secure link has expired or was already used.",
      403
    );
  }

  // 5. Fetch Topic & Unit & Subject Metadata from Supabase
  const supabase = await createServerSupabaseClient();
  const { data: topicRow, error: topicErr } = await supabase
    .from("subject_note_topics")
    .select("*")
    .eq("id", topicId)
    .eq("is_active", true)
    .maybeSingle();

  if (topicErr || !topicRow) {
    return buildBlockedHtmlResponse("Requested topic note was not found.", 404);
  }

  if (intent === "download" && topicRow.is_pdf_downloadable === false) {
    return buildBlockedHtmlResponse(
      "Downloading is disabled for this topic.",
      403
    );
  }

  const { data: unitRow } = await supabase
    .from("subject_note_units")
    .select("id, subject_id, unit_number, title, syllabus_text, important_topics")
    .eq("id", topicRow.note_unit_id)
    .maybeSingle();

  const subjectId =
    (topicRow.subject_id as string | null) || unitRow?.subject_id;

  const { data: subjectRow } = subjectId
    ? await supabase
        .from("subjects")
        .select("id, code, name")
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

  // Canonical 4-level R2 Hierarchy: <university>/<subject_code>/unit_<N>_<unit_name>/topic_<X_Y>_<topic_name>.pdf
  const r2HierarchyPath = buildCanonicalR2NotePath({
    universityShortName: uniRow?.short_name || uniRow?.name || "makaut",
    subjectCode: subjectRow?.code || "subject",
    unitNumber: unitRow?.unit_number ?? 1,
    unitTitle: unitRow?.title || "module",
    topicNumber: topicRow.topic_number || "1.1",
    topicTitle: topicRow.title || "notes",
  });

  const watermarkInfo: StudentWatermarkInfo = {
    studentId: user.id,
    studentName: user.fullName,
    studentEmail: user.email,
    studentPhone: user.phone,
    subjectCode: subjectRow?.code || "SUBJ",
    subjectName: subjectRow?.name || "Academic Subject",
    unitNumber: unitRow?.unit_number ?? 1,
    unitTitle: unitRow?.title || "Study Unit",
    topicNumber: String(topicRow.topic_number || "1.1"),
    topicTitle: String(topicRow.title || "Topic Notes"),
  };

  // 6. Fetch raw PDF from Private Cloudflare R2 (notes-bucket) or fallback
  const storageBucket =
    (topicRow.pdf_storage_bucket as string | null) || "notes-bucket";
  const storagePath =
    (topicRow.pdf_storage_path as string | null) || r2HierarchyPath;

  let watermarkedPdfBytes: Uint8Array;

  const rawStoragePdf = await fetchPrivateStudyFile(storageBucket, storagePath);

  if (rawStoragePdf && rawStoragePdf.byteLength > 0) {
    // Stamp watermark on EVERY SINGLE PAGE of the R2/Storage PDF
    watermarkedPdfBytes = await stampWatermarkOnEveryPage(
      rawStoragePdf,
      watermarkInfo
    );
  } else {
    // Fallback: Synthesize typeset PDF from topic's compiled notes & stamp watermark on EVERY SINGLE PAGE
    const compiledNotes = Array.isArray(topicRow.compiled_notes)
      ? (topicRow.compiled_notes as CompiledNoteItem[])
      : [];

    watermarkedPdfBytes = await generateWatermarkedTopicPdf({
      watermarkInfo,
      topicSummary: topicRow.summary as string | null,
      syllabusText: unitRow?.syllabus_text ?? null,
      importantTopics: unitRow?.important_topics ?? null,
      compiledNotes,
    });
  }

  const safeSubjectCode = (subjectRow?.code || "Qoncepto").replace(
    /[^a-zA-Z0-9_-]/g,
    "_"
  );
  const safeTopicNum = String(topicRow.topic_number || "1").replace(
    /[^a-zA-Z0-9._-]/g,
    "_"
  );
  const filename = `Qoncepto_${safeSubjectCode}_Topic_${safeTopicNum}_Notes.pdf`;

  return new NextResponse(new Uint8Array(watermarkedPdfBytes), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition":
        intent === "download"
          ? `attachment; filename="${filename}"`
          : `inline; filename="${filename}"`,
      "Cache-Control": "private, no-store, no-cache, must-revalidate, max-age=0",
      Pragma: "no-cache",
      Expires: "0",
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "SAMEORIGIN",
    },
  });
}
