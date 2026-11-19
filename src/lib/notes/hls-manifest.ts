import crypto from "node:crypto";

const SAFE_HLS_SEGMENT_REGEX = /^[a-zA-Z0-9._-]+\.(ts|m4s|key)$/;

export function isHlsManifestPath(path: string | null | undefined): boolean {
  return Boolean(path && path.trim().toLowerCase().endsWith(".m3u8"));
}

export function isSafeHlsSegmentName(segment: string | null | undefined): boolean {
  if (!segment) return false;
  return SAFE_HLS_SEGMENT_REGEX.test(segment) && !segment.includes("..");
}

/**
 * Resolves the sibling path of an HLS segment inside the same lecture folder as its `.m3u8` manifest.
 */
export function resolveHlsSegmentPath(
  manifestPath: string,
  segmentName: string
): string {
  const cleanManifest = manifestPath.replace(/^\/+/, "");
  const slashIdx = cleanManifest.lastIndexOf("/");
  const folder = slashIdx >= 0 ? cleanManifest.slice(0, slashIdx + 1) : "";
  return `${folder}${segmentName}`;
}

/**
 * Rewrites relative `.ts` / `.m4s` / `.key` segment references in a `.m3u8` playlist
 * so every chunk routes through Qoncepto's DRM-authenticated video endpoint.
 */
export function rewriteHlsManifestSegments(
  manifestText: string,
  topicId: string,
  ticket: string
): string {
  const encodedTopic = encodeURIComponent(topicId);
  const encodedTicket = encodeURIComponent(ticket);

  return manifestText
    .split(/\r?\n/)
    .map((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) {
        return line;
      }
      const cleanName = trimmed.split("?")[0].split("/").pop() || "";
      if (!isSafeHlsSegmentName(cleanName)) {
        return line;
      }
      return `/api/notes/video/${encodedTopic}?intent=video&ticket=${encodedTicket}&segment=${encodeURIComponent(cleanName)}`;
    })
    .join("\n");
}

/**
 * Signs an HMAC-SHA256 token compatible with `workers/media-gatekeeper`
 * bound to a specific lecture directory prefix and expiration timestamp.
 */
export function signMediaGatekeeperUrl(params: {
  baseUrl: string;
  storagePath: string;
  ttlSeconds?: number;
  secret: string;
}): string {
  const cleanBase = params.baseUrl.replace(/\/+$/, "");
  const cleanPath = params.storagePath.replace(/^\/+/, "");
  const pathname = `/${cleanPath}`;
  const slashIdx = pathname.lastIndexOf("/");
  const lecturePrefix = slashIdx > 0 ? pathname.slice(0, slashIdx + 1) : "/";

  const exp = String(Math.floor(Date.now() / 1000) + (params.ttlSeconds ?? 120));
  const token = crypto
    .createHmac("sha256", params.secret)
    .update(`${lecturePrefix}:${exp}`, "utf8")
    .digest("hex");

  return `${cleanBase}${pathname}?token=${token}&exp=${exp}`;
}
