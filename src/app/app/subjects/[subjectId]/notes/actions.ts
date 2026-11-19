"use server";

import { cookies } from "next/headers";
import { createServerSupabaseClient, getAuthenticatedUser } from "@/lib/supabase/server";
import {
  createDrmStreamTicket,
  type DrmMediaIntent,
} from "@/lib/notes/drm-ticket";
import {
  isHlsManifestPath,
  signMediaGatekeeperUrl,
} from "@/lib/notes/hls-manifest";

/**
 * Mints a short-lived, device-bound DRM ticket for viewing/downloading a Topic PDF,
 * or authorizing a Topic Video stream (HLS Gatekeeper Worker or Next.js DRM proxy).
 */
export async function issueTopicDrmTicket(
  topicId: string,
  intent: DrmMediaIntent
): Promise<{
  ok: boolean;
  url?: string;
  ticket?: string;
  isHls?: boolean;
  error?: string;
}> {
  if (!topicId) {
    return { ok: false, error: "Invalid topic ID." };
  }

  const user = await getAuthenticatedUser();
  if (!user) {
    return {
      ok: false,
      error: "Your session has expired. Please sign in again.",
    };
  }

  const cookieStore = await cookies();
  const browserDeviceToken =
    cookieStore.get("qoncepto_device_token")?.value || "";
  const activeDeviceToken =
    typeof user.rawUser.user_metadata?.active_device_token === "string"
      ? user.rawUser.user_metadata.active_device_token
      : "";

  // Enforce single-device session lock before issuing any media ticket
  if (
    activeDeviceToken &&
    (!browserDeviceToken || activeDeviceToken !== browserDeviceToken)
  ) {
    return {
      ok: false,
      error:
        "Session expired: Your account is signed in on another device or browser.",
    };
  }

  const effectiveDeviceToken =
    browserDeviceToken || activeDeviceToken || "session-bound";

  let isHls = false;
  if (intent === "video") {
    const supabase = await createServerSupabaseClient();
    const { data: topicRow } = await supabase
      .from("subject_note_topics")
      .select("video_storage_path")
      .eq("id", topicId)
      .eq("is_active", true)
      .maybeSingle();

    const videoPath = topicRow?.video_storage_path as string | null | undefined;
    isHls = isHlsManifestPath(videoPath);

    const gatekeeperBase = process.env.MEDIA_GATEKEEPER_URL?.trim();
    const gatekeeperSecret =
      process.env.MEDIA_SIGNING_SECRET?.trim() ||
      process.env.DRM_SIGNING_SECRET?.trim() ||
      process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

    if (isHls && videoPath && gatekeeperBase && gatekeeperSecret) {
      const signedUrl = signMediaGatekeeperUrl({
        baseUrl: gatekeeperBase,
        storagePath: videoPath,
        ttlSeconds: 120,
        secret: gatekeeperSecret,
      });

      return {
        ok: true,
        url: signedUrl,
        isHls: true,
      };
    }
  }

  const ticket = createDrmStreamTicket({
    userId: user.id,
    deviceToken: effectiveDeviceToken,
    topicId,
    intent,
    ttlSeconds: intent === "video" ? 14400 : 60,
  });

  const endpointBase =
    intent === "video"
      ? `/api/notes/video/${encodeURIComponent(topicId)}`
      : `/api/notes/pdf/${encodeURIComponent(topicId)}`;

  const url = `${endpointBase}?intent=${encodeURIComponent(
    intent
  )}&ticket=${encodeURIComponent(ticket)}`;

  return {
    ok: true,
    url,
    ticket,
    isHls,
  };
}
