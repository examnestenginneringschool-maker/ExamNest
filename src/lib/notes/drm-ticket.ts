import crypto from "node:crypto";

export type DrmMediaIntent = "view" | "download" | "video";

export interface DrmTicketPayload {
  userId: string;
  deviceToken: string;
  topicId: string;
  intent: DrmMediaIntent;
  exp: number;
  nonce: string;
}

const CONSUMED_NONCES = new Map<string, number>();
const MAX_NONCE_CACHE = 10000;

function getDrmSigningSecret(): string {
  return (
    process.env.DRM_SIGNING_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    "qoncepto-drm-default-signing-secret-2026"
  );
}

function pruneExpiredNonces(nowMs: number) {
  if (CONSUMED_NONCES.size < MAX_NONCE_CACHE) return;
  for (const [nonce, expiresAtMs] of CONSUMED_NONCES.entries()) {
    if (expiresAtMs <= nowMs) {
      CONSUMED_NONCES.delete(nonce);
    }
  }
}

/**
 * Generates a short-lived, single-use, device-bound HMAC-SHA256 ticket for viewing or downloading
 * a topic's PDF or streaming a topic's video.
 * Sharing this URL with any other user, browser, or tab will fail verification.
 */
export function createDrmStreamTicket(params: {
  userId: string;
  deviceToken: string;
  topicId: string;
  intent: DrmMediaIntent;
  ttlSeconds?: number;
}): string {
  const ttl = params.ttlSeconds ?? 60;
  const payload: DrmTicketPayload = {
    userId: params.userId,
    deviceToken: params.deviceToken || "session-bound",
    topicId: params.topicId,
    intent: params.intent,
    exp: Math.floor(Date.now() / 1000) + ttl,
    nonce: crypto.randomBytes(12).toString("hex"),
  };

  const payloadBase64 = Buffer.from(JSON.stringify(payload), "utf-8").toString(
    "base64url"
  );
  const signature = crypto
    .createHmac("sha256", getDrmSigningSecret())
    .update(payloadBase64)
    .digest("base64url");

  return `${payloadBase64}.${signature}`;
}

/**
 * Verifies a DRM ticket's cryptographic signature, expiration, userId, deviceToken, topicId,
 * and intent, and burns its one-time nonce so the URL can never be reused or shared.
 */
export function verifyAndConsumeDrmTicket(params: {
  ticket: string | null | undefined;
  expectedUserId: string;
  expectedDeviceToken: string;
  expectedTopicId: string;
  expectedIntent: DrmMediaIntent;
  consumeNonce?: boolean;
}): { valid: boolean; reason?: string } {
  const {
    ticket,
    expectedUserId,
    expectedDeviceToken,
    expectedTopicId,
    expectedIntent,
    consumeNonce = true,
  } = params;

  if (!ticket || typeof ticket !== "string") {
    return {
      valid: false,
      reason: "Missing security ticket. Direct link access is blocked.",
    };
  }

  const parts = ticket.split(".");
  if (parts.length !== 2) {
    return { valid: false, reason: "Malformed security ticket." };
  }

  const [payloadBase64, providedSig] = parts;
  if (!payloadBase64 || !providedSig) {
    return { valid: false, reason: "Invalid security ticket." };
  }

  const expectedSig = crypto
    .createHmac("sha256", getDrmSigningSecret())
    .update(payloadBase64)
    .digest("base64url");

  const sigBufferA = Buffer.from(providedSig);
  const sigBufferB = Buffer.from(expectedSig);
  if (
    sigBufferA.length !== sigBufferB.length ||
    !crypto.timingSafeEqual(sigBufferA, sigBufferB)
  ) {
    return {
      valid: false,
      reason: "Invalid cryptographic signature. Link tampering detected.",
    };
  }

  let payload: DrmTicketPayload;
  try {
    payload = JSON.parse(
      Buffer.from(payloadBase64, "base64url").toString("utf-8")
    ) as DrmTicketPayload;
  } catch {
    return { valid: false, reason: "Corrupted ticket payload." };
  }

  const nowSeconds = Math.floor(Date.now() / 1000);
  if (!payload.exp || payload.exp < nowSeconds) {
    return {
      valid: false,
      reason: "This secure stream ticket has expired. Please reload the topic.",
    };
  }

  if (payload.userId !== expectedUserId) {
    return {
      valid: false,
      reason:
        "Access blocked: This URL belongs to another student account and cannot be shared.",
    };
  }

  const normalizedExpectedDevice = expectedDeviceToken || "session-bound";
  if (payload.deviceToken !== normalizedExpectedDevice) {
    return {
      valid: false,
      reason:
        "Access blocked: This URL is bound to another device session and cannot be shared.",
    };
  }

  if (payload.topicId !== expectedTopicId) {
    return {
      valid: false,
      reason: "Access blocked: Topic mismatch.",
    };
  }

  if (payload.intent !== expectedIntent) {
    return {
      valid: false,
      reason: "Access blocked: Unauthorized media intent.",
    };
  }

  const nowMs = Date.now();
  pruneExpiredNonces(nowMs);

  const existingExpiry = CONSUMED_NONCES.get(payload.nonce);
  if (existingExpiry && existingExpiry > nowMs) {
    return {
      valid: false,
      reason:
        "Access blocked: One-time secure link has already been used. Copy-pasting or sharing URLs is strictly prohibited.",
    };
  }

  if (consumeNonce) {
    CONSUMED_NONCES.set(payload.nonce, payload.exp * 1000 + 60_000);
  }

  return { valid: true };
}
