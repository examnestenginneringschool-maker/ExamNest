"use client";

import { createBrowserSupabaseClient } from "@/lib/supabase/client";

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/heic",
  "image/heif",
]);

// Allow users to pick large high-res photos (up to 50 MB) directly from phone/DSLR cameras.
// Our client-side canvas engine will compress and crop them to ~30 KB - 80 KB (< 0.1 MB) before upload.
const MAX_INPUT_FILE_BYTES = 50 * 1024 * 1024; // 50 MB
const TARGET_MAX_OUTPUT_BYTES = 500 * 1024; // Strictly ensure output is < 500 KB (well under 1 MB)
const MAX_INLINE_DATA_URL_LENGTH = 5600;

export type AvatarUploadResult = {
  avatarUrl: string;
  storageMode: "supabase-storage" | "inline-compact";
};

function loadImageElement(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(img);
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(
        new Error("Could not read this image file. Please choose a valid JPG, PNG, or WebP photo.")
      );
    };

    img.src = objectUrl;
  });
}

function renderCenteredSquareCanvas(
  img: HTMLImageElement,
  size: number
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Your browser does not support image canvas rendering.");
  }

  const side = Math.min(img.naturalWidth || img.width, img.naturalHeight || img.height);
  const sx = Math.max(0, Math.floor(((img.naturalWidth || img.width) - side) / 2));
  const sy = Math.max(0, Math.floor(((img.naturalHeight || img.height) - side) / 2));

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, sx, sy, side, side, 0, 0, size, size);

  return canvas;
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  mimeType: string,
  quality: number
): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), mimeType, quality);
  });
}

/**
 * Adaptive compression pipeline:
 * Takes any source image (even 20MB - 50MB) and compresses it into a high-density
 * 280x280 square WebP/JPEG that is guaranteed to be under 500 KB (typically ~35 KB - 80 KB).
 */
async function compressImageForStorage(
  img: HTMLImageElement
): Promise<{ blob: Blob; ext: "webp" | "jpg"; contentType: string }> {
  const targetDimension = 280; // High-DPI retina sharpness for 36px-72px avatars
  const canvas = renderCenteredSquareCanvas(img, targetDimension);

  const compressionSteps: Array<{ mime: string; ext: "webp" | "jpg"; quality: number }> = [
    { mime: "image/webp", ext: "webp", quality: 0.82 },
    { mime: "image/webp", ext: "webp", quality: 0.70 },
    { mime: "image/webp", ext: "webp", quality: 0.55 },
    { mime: "image/jpeg", ext: "jpg", quality: 0.80 },
    { mime: "image/jpeg", ext: "jpg", quality: 0.65 },
  ];

  for (const step of compressionSteps) {
    const blob = await canvasToBlob(canvas, step.mime, step.quality);
    if (blob && blob.size > 0 && blob.size <= TARGET_MAX_OUTPUT_BYTES) {
      return {
        blob,
        ext: step.ext,
        contentType: step.mime,
      };
    }
  }

  // Final fallback: resize to 200x200 if image content was abnormally heavy
  const fallbackCanvas = renderCenteredSquareCanvas(img, 200);
  const finalBlob =
    (await canvasToBlob(fallbackCanvas, "image/webp", 0.65)) ||
    (await canvasToBlob(fallbackCanvas, "image/jpeg", 0.70));

  if (!finalBlob) {
    throw new Error("Could not compress this image.");
  }

  return {
    blob: finalBlob,
    ext: finalBlob.type.includes("webp") ? "webp" : "jpg",
    contentType: finalBlob.type,
  };
}

function buildCompactDataUrl(img: HTMLImageElement): string {
  const attempts: Array<{ size: number; mime: string; quality: number }> = [
    { size: 96, mime: "image/webp", quality: 0.72 },
    { size: 96, mime: "image/webp", quality: 0.54 },
    { size: 80, mime: "image/webp", quality: 0.45 },
    { size: 72, mime: "image/jpeg", quality: 0.58 },
    { size: 64, mime: "image/jpeg", quality: 0.48 },
  ];

  for (const { size, mime, quality } of attempts) {
    const canvas = renderCenteredSquareCanvas(img, size);
    const dataUrl = canvas.toDataURL(mime, quality);
    if (
      /^data:image\/(webp|jpeg|png);base64,/.test(dataUrl) &&
      dataUrl.length <= MAX_INLINE_DATA_URL_LENGTH
    ) {
      return dataUrl;
    }
  }

  throw new Error(
    "This photo is too complex for inline fallback. Please check your internet connection and try again."
  );
}

/**
 * Validates, center-crops, and automatically compresses ANY uploaded avatar image down to
 * under 100 KB - 500 KB (guaranteed << 1 MB) before sending to Supabase Storage.
 * This completely prevents "Max file size exceeded" errors from Supabase.
 */
export async function processAndUploadAvatar(
  file: File,
  userId: string
): Promise<AvatarUploadResult> {
  const fileType = file.type.toLowerCase();
  // Allow empty type if file extension is an image (some mobile browsers report empty type)
  const isImageByExt = /\.(jpe?g|png|webp|gif|heic|heif)$/i.test(file.name);
  if (fileType && !ALLOWED_IMAGE_TYPES.has(fileType) && !isImageByExt) {
    throw new Error("Please select an image file (PNG, JPG, or WebP).");
  }

  if (file.size > MAX_INPUT_FILE_BYTES) {
    throw new Error("Please select an image smaller than 50 MB.");
  }

  const img = await loadImageElement(file);
  const { blob, ext, contentType } = await compressImageForStorage(img);

  try {
    const supabase = createBrowserSupabaseClient();
    const filePath = `${userId}/avatar.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, blob, {
        upsert: true,
        contentType,
        cacheControl: "3600",
      });

    if (!uploadError) {
      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(filePath);

      if (publicUrl) {
        return {
          avatarUrl: `${publicUrl}?v=${Date.now()}`,
          storageMode: "supabase-storage",
        };
      }
    }
  } catch {
    // Storage bucket not provisioned or offline — fall through cleanly to compact inline avatar
  }

  const compactUrl = buildCompactDataUrl(img);
  return {
    avatarUrl: compactUrl,
    storageMode: "inline-compact",
  };
}

/**
 * Deletes any existing avatar files from the Supabase Storage bucket for this student.
 */
export async function deleteAvatarFromStorage(userId: string): Promise<void> {
  try {
    const supabase = createBrowserSupabaseClient();
    await supabase.storage.from("avatars").remove([
      `${userId}/avatar.webp`,
      `${userId}/avatar.jpg`,
      `${userId}/avatar.png`,
    ]);
  } catch {
    // Ignore storage delete errors (e.g. bucket doesn't exist or already removed)
  }
}
