"use server";

import { cookies } from "next/headers";
import { getAuthenticatedUser } from "@/lib/supabase/server";
import {
  createDrmStreamTicket,
  type DrmMediaIntent,
} from "@/lib/notes/drm-ticket";

/**
 * Mints a short-lived, single-use, device-bound DRM ticket for viewing a Topic PDF on-screen,
 * downloading a Topic PDF (with per-page watermark), or streaming a non-downloadable Topic Video.
 */
export async function issueTopicDrmTicket(
  topicId: string,
  intent: DrmMediaIntent
): Promise<{
  ok: boolean;
  url?: string;
  ticket?: string;
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

  const ticket = createDrmStreamTicket({
    userId: user.id,
    deviceToken: effectiveDeviceToken,
    topicId,
    intent,
    ttlSeconds: intent === "video" ? 120 : 60,
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
  };
}
