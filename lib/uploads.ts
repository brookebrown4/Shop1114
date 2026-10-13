import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "custom-logos");
const PUBLIC_PATH_PREFIX = "/uploads/custom-logos";

const ALLOWED_TYPES: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/svg+xml": "svg",
};

const MAX_BYTES = 5 * 1024 * 1024; // 5MB

export type UploadResult = { url: string } | { error: string };

// Saves a customer-uploaded logo/artwork file to public/uploads/custom-logos
// and returns its public URL. Local-filesystem storage is fine for this
// project's current scale (SQLite, single instance) — swap for real object
// storage (S3/Vercel Blob/etc.) before running on more than one server
// instance, since local files won't be shared across processes.
export async function saveCustomOrderLogo(file: File): Promise<UploadResult> {
  const extension = ALLOWED_TYPES[file.type];
  if (!extension) {
    return { error: "Please upload a PNG, JPG, WEBP, or SVG file." };
  }
  if (file.size > MAX_BYTES) {
    return { error: "File is too large — please upload something under 5MB." };
  }

  await mkdir(UPLOAD_DIR, { recursive: true });

  const filename = `${randomUUID()}.${extension}`;
  const bytes = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(UPLOAD_DIR, filename), bytes);

  return { url: `${PUBLIC_PATH_PREFIX}/${filename}` };
}
