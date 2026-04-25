import { randomUUID } from "crypto";
import { mkdir, unlink } from "fs/promises";
import { existsSync } from "fs";
import { join, normalize } from "path";
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png"]);
const ALLOWED_EXTS = new Set(["jpg", "jpeg", "png"]);

// R2 is enabled when all required env vars are present
const USE_R2 = !!(
  process.env.R2_ACCOUNT_ID &&
  process.env.R2_ACCESS_KEY_ID &&
  process.env.R2_SECRET_ACCESS_KEY &&
  process.env.R2_BUCKET_NAME
);

// ── R2 client (lazy — only constructed when needed) ──────────────────────────

function getR2Client(): S3Client {
  return new S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
  });
}

async function uploadToR2(file: File, key: string): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  await getR2Client().send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: key,
      Body: buffer,
      ContentType: file.type,
    })
  );
  const publicUrl = process.env.R2_PUBLIC_URL || `https://${process.env.R2_BUCKET_NAME}.r2.dev`;
  return `${publicUrl}/${key}`;
}

async function deleteFromR2(key: string): Promise<void> {
  await getR2Client().send(
    new DeleteObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: key,
    })
  );
}

// ── Local storage ─────────────────────────────────────────────────────────────

const UPLOAD_DIR = join(process.cwd(), "public", "uploads");
const LOCAL_PUBLIC_URL = process.env.PUBLIC_URL || "http://localhost:4000";

async function ensureUploadDir() {
  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true });
  }
}

async function uploadToLocal(file: File, key: string): Promise<string> {
  await ensureUploadDir();
  const buffer = Buffer.from(await file.arrayBuffer());
  await Bun.write(join(UPLOAD_DIR, key), buffer);
  return `${LOCAL_PUBLIC_URL}/uploads/${key}`;
}

async function deleteFromLocal(url: string): Promise<void> {
  const key = url.split("/uploads/")[1];
  if (!key) return;
  const filePath = normalize(join(UPLOAD_DIR, key));
  if (!filePath.startsWith(UPLOAD_DIR)) return; // path traversal guard
  if (existsSync(filePath)) await unlink(filePath);
}

// ── Public API ────────────────────────────────────────────────────────────────

function validateFile(file: File) {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (!ALLOWED_EXTS.has(ext) || !ALLOWED_TYPES.has(file.type)) {
    throw new Error("รองรับเฉพาะไฟล์ .jpg หรือ .png เท่านั้น");
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new Error("ไฟล์มีขนาดใหญ่เกิน 5 MB");
  }
  return file.name.split(".").pop()!.toLowerCase();
}

export async function uploadImage(file: File): Promise<string> {
  const ext = validateFile(file);
  const key = `${randomUUID()}.${ext}`;

  if (USE_R2) {
    return uploadToR2(file, key);
  }
  return uploadToLocal(file, key);
}

export async function deleteImage(url: string): Promise<void> {
  if (USE_R2) {
    // Extract key: everything after the R2 public URL base
    const publicUrl = process.env.R2_PUBLIC_URL || `https://${process.env.R2_BUCKET_NAME}.r2.dev`;
    const key = url.startsWith(publicUrl) ? url.slice(publicUrl.length + 1) : null;
    if (!key) return;
    await deleteFromR2(key);
  } else {
    await deleteFromLocal(url);
  }
}
