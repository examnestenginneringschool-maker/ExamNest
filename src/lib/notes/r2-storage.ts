import crypto from "node:crypto";
import { createClient } from "@supabase/supabase-js";

function sha256Hex(data: string | Buffer): string {
  return crypto.createHash("sha256").update(data).digest("hex");
}

function hmacSha256(key: string | Buffer, data: string): Buffer {
  return crypto.createHmac("sha256", key).update(data, "utf8").digest();
}

/**
 * Converts any string or number into a clean, lowercase, underscore-separated slug
 * safe for Cloudflare R2 object keys (e.g., "BS-PH101" -> "bs_ph101",
 * "Simple Harmonic Motion" -> "simple_harmonic_motion", "1.1" -> "1_1").
 */
export function toStorageSlug(
  input: string | number | null | undefined,
  fallback = "item"
): string {
  if (input === null || input === undefined) return fallback;
  const cleaned = String(input)
    .toLowerCase()
    .trim()
    .replace(/['’`]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
  return cleaned || fallback;
}

export interface CanonicalR2PathParams {
  universityShortName?: string | null;
  subjectCode: string | null | undefined;
  unitNumber: number | string | null | undefined;
  unitTitle: string | null | undefined;
  topicNumber: string | number | null | undefined;
  topicTitle: string | null | undefined;
}

/**
 * Builds the canonical 4-level Cloudflare R2 path for a topic note PDF:
 * `<university>/<subject_code>/unit_<N>_<unit_name>/topic_<X_Y>_<topic_name>.pdf`
 * Example: `makaut/bs_ph101/unit_1_simple_harmonic_motion/topic_1_1_introduction.pdf`
 */
export function buildCanonicalR2NotePath(params: CanonicalR2PathParams): string {
  const uniSlug = toStorageSlug(params.universityShortName, "makaut");
  const subjectSlug = toStorageSlug(params.subjectCode, "subject");
  const unitNum = toStorageSlug(params.unitNumber, "1");
  const unitTitleSlug = toStorageSlug(params.unitTitle, "module");
  const unitFolder = `unit_${unitNum}_${unitTitleSlug}`;
  const topicNumSlug = toStorageSlug(params.topicNumber, "1_1");
  const topicTitleSlug = toStorageSlug(params.topicTitle, "notes");
  const topicFile = `topic_${topicNumSlug}_${topicTitleSlug}.pdf`;

  return `${uniSlug}/${subjectSlug}/${unitFolder}/${topicFile}`;
}

/**
 * Builds the canonical 4-level Cloudflare R2 path for a topic video lecture:
 * `<university>/<subject_code>/unit_<N>_<unit_name>/lecture_<X_Y>_<topic_name>.mp4`
 * Example: `makaut/bs_ph101/unit_1_simple_harmonic_motion/lecture_1_1_introduction.mp4`
 */
export function buildCanonicalR2VideoPath(
  params: CanonicalR2PathParams
): string {
  const uniSlug = toStorageSlug(params.universityShortName, "makaut");
  const subjectSlug = toStorageSlug(params.subjectCode, "subject");
  const unitNum = toStorageSlug(params.unitNumber, "1");
  const unitTitleSlug = toStorageSlug(params.unitTitle, "module");
  const unitFolder = `unit_${unitNum}_${unitTitleSlug}`;
  const topicNumSlug = toStorageSlug(params.topicNumber, "1_1");
  const topicTitleSlug = toStorageSlug(params.topicTitle, "lecture");
  const videoFile = `lecture_${topicNumSlug}_${topicTitleSlug}.mp4`;

  return `${uniSlug}/${subjectSlug}/${unitFolder}/${videoFile}`;
}

/**
 * Fetches an object directly from a Private Cloudflare R2 Bucket using AWS Signature V4.
 * Works with ZERO custom domain required (`https://<ACCOUNT_ID>.r2.cloudflarestorage.com`).
 */
async function fetchFromCloudflareR2(
  storagePath: string,
  bucketOverride?: string
): Promise<Uint8Array | null> {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucketName =
    bucketOverride || process.env.R2_BUCKET_NAME || "notes-bucket";

  if (!accountId || !accessKeyId || !secretAccessKey) {
    return null;
  }

  const cleanKey = storagePath.replace(/^\/+/, "");
  const encodedKey = cleanKey
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");

  const host = `${accountId}.r2.cloudflarestorage.com`;
  const canonicalUri = `/${bucketName}/${encodedKey}`;
  const endpoint = `https://${host}${canonicalUri}`;

  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
  const dateStamp = amzDate.slice(0, 8);
  const region = "auto";
  const service = "s3";

  const payloadHash = "UNSIGNED-PAYLOAD";
  const canonicalHeaders =
    `host:${host}\n` +
    `x-amz-content-sha256:${payloadHash}\n` +
    `x-amz-date:${amzDate}\n`;
  const signedHeaders = "host;x-amz-content-sha256;x-amz-date";

  const canonicalRequest = [
    "GET",
    canonicalUri,
    "",
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join("\n");

  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
  const stringToSign = [
    "AWS4-HMAC-SHA256",
    amzDate,
    credentialScope,
    sha256Hex(canonicalRequest),
  ].join("\n");

  const kDate = hmacSha256(`AWS4${secretAccessKey}`, dateStamp);
  const kRegion = hmacSha256(kDate, region);
  const kService = hmacSha256(kRegion, service);
  const kSigning = hmacSha256(kService, "aws4_request");
  const signature = crypto
    .createHmac("sha256", kSigning)
    .update(stringToSign, "utf8")
    .digest("hex");

  const authorizationHeader =
    `AWS4-HMAC-SHA256 Credential=${accessKeyId}/${credentialScope}, ` +
    `SignedHeaders=${signedHeaders}, Signature=${signature}`;

  try {
    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        Authorization: authorizationHeader,
        "x-amz-content-sha256": payloadHash,
        "x-amz-date": amzDate,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const arrayBuffer = await response.arrayBuffer();
    return new Uint8Array(arrayBuffer);
  } catch {
    return null;
  }
}

/**
 * Fetches an object from a Private Supabase Storage Bucket using the Service Role Key.
 */
async function fetchFromSupabasePrivateBucket(
  bucket: string,
  storagePath: string
): Promise<Uint8Array | null> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey || !storagePath) {
    return null;
  }

  try {
    const adminSupabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    const cleanPath = storagePath.replace(/^\/+/, "");
    const { data, error } = await adminSupabase.storage
      .from(bucket || "notes-bucket")
      .download(cleanPath);

    if (error || !data) {
      return null;
    }

    const arrayBuffer = await data.arrayBuffer();
    return new Uint8Array(arrayBuffer);
  } catch {
    return null;
  }
}

/**
 * Retrieves a raw PDF or media binary from Private Cloudflare R2 (primary)
 * or Private Supabase Storage Bucket (fallback). Never exposes any public URL.
 */
export async function fetchPrivateStudyFile(
  bucket: string,
  storagePath: string | null | undefined
): Promise<Uint8Array | null> {
  if (!storagePath) return null;

  const targetBucket = bucket || process.env.R2_BUCKET_NAME || "notes-bucket";

  // 1. Primary: Private Cloudflare R2 Bucket (S3 API with AWS Signature V4)
  const r2Bytes = await fetchFromCloudflareR2(storagePath, targetBucket);
  if (r2Bytes && r2Bytes.byteLength > 0) {
    return r2Bytes;
  }

  // 2. Fallback: Private Supabase Storage Bucket
  const sbBytes = await fetchFromSupabasePrivateBucket(
    targetBucket,
    storagePath
  );
  if (sbBytes && sbBytes.byteLength > 0) {
    return sbBytes;
  }

  return null;
}

/**
 * Uploads a buffer or Uint8Array directly to Cloudflare R2 using AWS Signature V4.
 */
export async function uploadToCloudflareR2(
  storagePath: string,
  fileBytes: Uint8Array,
  contentType = "application/pdf",
  bucketOverride?: string
): Promise<{ success: boolean; error?: string }> {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucketName =
    bucketOverride || process.env.R2_BUCKET_NAME || "notes-bucket";

  if (!accountId || !accessKeyId || !secretAccessKey) {
    return { success: false, error: "Missing R2 credentials in environment." };
  }

  const cleanKey = storagePath.replace(/^\/+/, "");
  const encodedKey = cleanKey
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");

  const host = `${accountId}.r2.cloudflarestorage.com`;
  const canonicalUri = `/${bucketName}/${encodedKey}`;
  const endpoint = `https://${host}${canonicalUri}`;

  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
  const dateStamp = amzDate.slice(0, 8);
  const region = "auto";
  const service = "s3";

  const buffer = Buffer.from(fileBytes);
  const payloadHash = sha256Hex(buffer);
  const canonicalHeaders =
    `content-type:${contentType}\n` +
    `host:${host}\n` +
    `x-amz-content-sha256:${payloadHash}\n` +
    `x-amz-date:${amzDate}\n`;
  const signedHeaders = "content-type;host;x-amz-content-sha256;x-amz-date";

  const canonicalRequest = [
    "PUT",
    canonicalUri,
    "",
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join("\n");

  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
  const stringToSign = [
    "AWS4-HMAC-SHA256",
    amzDate,
    credentialScope,
    sha256Hex(canonicalRequest),
  ].join("\n");

  const kDate = hmacSha256(`AWS4${secretAccessKey}`, dateStamp);
  const kRegion = hmacSha256(kDate, region);
  const kService = hmacSha256(kRegion, service);
  const kSigning = hmacSha256(kService, "aws4_request");
  const signature = crypto
    .createHmac("sha256", kSigning)
    .update(stringToSign, "utf8")
    .digest("hex");

  const authorizationHeader =
    `AWS4-HMAC-SHA256 Credential=${accessKeyId}/${credentialScope}, ` +
    `SignedHeaders=${signedHeaders}, Signature=${signature}`;

  try {
    const response = await fetch(endpoint, {
      method: "PUT",
      headers: {
        Authorization: authorizationHeader,
        "content-type": contentType,
        "x-amz-content-sha256": payloadHash,
        "x-amz-date": amzDate,
      },
      body: buffer,
    });

    if (!response.ok) {
      const errText = await response.text();
      return {
        success: false,
        error: `R2 PUT failed [${response.status}]: ${errText}`,
      };
    }

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, error: msg };
  }
}
