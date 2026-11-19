interface R2ObjectBodyLike {
  body: ReadableStream<Uint8Array> | null;
  size?: number;
}

interface R2BucketLike {
  get(key: string): Promise<R2ObjectBodyLike | null>;
}

interface ExecutionContextLike {
  waitUntil(promise: Promise<unknown>): void;
}

export interface Env {
  MEDIA_BUCKET: R2BucketLike;
  MEDIA_SIGNING_SECRET: string;
  ALLOWED_ORIGIN: string;
}

const SEGMENT_CACHE_TTL_SECONDS = 2592000; // 30 days

function buildCorsHeaders(request: Request, allowedOrigin: string): Headers {
  const origin = request.headers.get("Origin");
  const headers = new Headers();

  if (origin && (allowedOrigin === "*" || origin === allowedOrigin)) {
    headers.set("Access-Control-Allow-Origin", origin);
    headers.set("Access-Control-Allow-Credentials", "true");
    headers.set("Vary", "Origin");
  }

  headers.set("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Range, Content-Type");
  return headers;
}

function getLecturePrefix(pathname: string): string {
  const idx = pathname.lastIndexOf("/");
  if (idx <= 0) return "/";
  return pathname.slice(0, idx + 1);
}

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

async function signHmacHex(secret: string, message: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(message));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function parseCookie(cookieHeader: string | null, name: string): string | null {
  if (!cookieHeader) return null;
  for (const part of cookieHeader.split(";")) {
    const [k, ...rest] = part.trim().split("=");
    if (k === name) {
      return rest.join("=");
    }
  }
  return null;
}

async function verifySessionCookie(
  cookieValue: string | null,
  lecturePrefix: string,
  secret: string
): Promise<boolean> {
  if (!cookieValue) return false;
  const parts = cookieValue.split(".");
  if (parts.length !== 2) return false;
  const [expStr, providedSig] = parts;
  const exp = Number(expStr);
  if (!Number.isFinite(exp) || Math.floor(Date.now() / 1000) > exp) {
    return false;
  }
  const expectedSig = await signHmacHex(
    secret,
    `cookie:${lecturePrefix}:${expStr}`
  );
  return constantTimeEqual(providedSig, expectedSig);
}

const worker = {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContextLike
  ): Promise<Response> {
    const corsHeaders = buildCorsHeaders(request, env.ALLOWED_ORIGIN);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (request.method !== "GET" && request.method !== "HEAD") {
      return new Response("Method Not Allowed", {
        status: 405,
        headers: corsHeaders,
      });
    }

    const url = new URL(request.url);
    const key = url.pathname.replace(/^\/+/, "");
    if (!key || key.includes("..")) {
      return new Response("Invalid media path", {
        status: 400,
        headers: corsHeaders,
      });
    }

    const lecturePrefix = getLecturePrefix(url.pathname);

    // 1. HLS Playlist (.m3u8): always validate ?token=&exp=, never cache, set scoped HttpOnly cookie
    if (key.endsWith(".m3u8")) {
      const token = url.searchParams.get("token") || "";
      const expStr = url.searchParams.get("exp") || "";
      const exp = Number(expStr);

      if (!token || !Number.isFinite(exp) || Math.floor(Date.now() / 1000) > exp) {
        return new Response("Expired or missing stream token", {
          status: 403,
          headers: corsHeaders,
        });
      }

      const expectedToken = await signHmacHex(
        env.MEDIA_SIGNING_SECRET,
        `${lecturePrefix}:${expStr}`
      );
      if (!constantTimeEqual(token, expectedToken)) {
        return new Response("Invalid stream signature", {
          status: 403,
          headers: corsHeaders,
        });
      }

      const object = await env.MEDIA_BUCKET.get(key);
      if (!object || !object.body) {
        return new Response("Playlist not found", {
          status: 404,
          headers: corsHeaders,
        });
      }

      // Issue a 4-hour scoped HttpOnly cookie for .ts segment requests in this lecture folder
      const cookieExp = String(Math.floor(Date.now() / 1000) + 14400);
      const cookieSig = await signHmacHex(
        env.MEDIA_SIGNING_SECRET,
        `cookie:${lecturePrefix}:${cookieExp}`
      );

      const headers = new Headers(corsHeaders);
      headers.set("Content-Type", "application/vnd.apple.mpegurl");
      headers.set("Cache-Control", "private, no-store, no-cache, must-revalidate");
      headers.append(
        "Set-Cookie",
        `video_session=${cookieExp}.${cookieSig}; HttpOnly; Secure; SameSite=None; Path=${lecturePrefix}; Max-Age=14400`
      );

      return new Response(object.body, { status: 200, headers });
    }

    // 2. HLS Video Segments (.ts / .m4s / .key): serve from Edge Cache or verify cookie & fetch R2
    if (key.endsWith(".ts") || key.endsWith(".m4s") || key.endsWith(".key")) {
      const edgeCache = (
        caches as unknown as { default?: Cache }
      ).default;
      const cacheKey = new Request(url.origin + url.pathname, { method: "GET" });

      if (edgeCache) {
        const cached = await edgeCache.match(cacheKey);
        if (cached) {
          const hitHeaders = new Headers(cached.headers);
          corsHeaders.forEach((v, k) => hitHeaders.set(k, v));
          return new Response(cached.body, {
            status: cached.status,
            headers: hitHeaders,
          });
        }
      }

      const cookieValue = parseCookie(
        request.headers.get("Cookie"),
        "video_session"
      );
      const isValidCookie = await verifySessionCookie(
        cookieValue,
        lecturePrefix,
        env.MEDIA_SIGNING_SECRET
      );
      if (!isValidCookie) {
        return new Response("Unauthorized segment request", {
          status: 403,
          headers: corsHeaders,
        });
      }

      const object = await env.MEDIA_BUCKET.get(key);
      if (!object || !object.body) {
        return new Response("Segment not found", {
          status: 404,
          headers: corsHeaders,
        });
      }

      const contentType = key.endsWith(".ts")
        ? "video/mp2t"
        : key.endsWith(".m4s")
          ? "video/iso.segment"
          : "application/octet-stream";

      const headers = new Headers(corsHeaders);
      headers.set("Content-Type", contentType);
      headers.set(
        "Cache-Control",
        `public, max-age=${SEGMENT_CACHE_TTL_SECONDS}, immutable`
      );
      if (typeof object.size === "number") {
        headers.set("Content-Length", String(object.size));
      }

      if (edgeCache) {
        const [clientBody, cacheBody] = object.body.tee();
        const cacheHeaders = new Headers(headers);
        ctx.waitUntil(
          edgeCache.put(
            cacheKey,
            new Response(cacheBody, { status: 200, headers: cacheHeaders })
          )
        );
        return new Response(clientBody, { status: 200, headers });
      }

      return new Response(object.body, { status: 200, headers });
    }

    return new Response("Unsupported media resource", {
      status: 403,
      headers: corsHeaders,
    });
  },
};

export default worker;
