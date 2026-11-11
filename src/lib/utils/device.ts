/**
 * Converts a raw HTTP User-Agent string into a clean, human-readable "Browser on OS" label.
 */
export function formatDeviceLabel(rawUserAgent?: string | null): string {
  if (!rawUserAgent) return "Web Browser";
  const ua = rawUserAgent.toLowerCase();

  let browser = "Web Browser";
  if (ua.includes("edg/")) {
    browser = "Microsoft Edge";
  } else if (ua.includes("opr/") || ua.includes("opera")) {
    browser = "Opera";
  } else if (ua.includes("chrome/") && !ua.includes("edg/")) {
    browser = "Google Chrome";
  } else if (ua.includes("firefox/")) {
    browser = "Mozilla Firefox";
  } else if (ua.includes("safari/") && !ua.includes("chrome/")) {
    browser = "Apple Safari";
  }

  let os = "Device";
  if (ua.includes("windows")) {
    os = "Windows";
  } else if (ua.includes("android")) {
    os = "Android";
  } else if (ua.includes("iphone") || ua.includes("ipad")) {
    os = "iOS";
  } else if (ua.includes("mac os x") || ua.includes("macintosh")) {
    os = "macOS";
  } else if (ua.includes("linux")) {
    os = "Linux";
  }

  return `${browser} on ${os}`;
}
