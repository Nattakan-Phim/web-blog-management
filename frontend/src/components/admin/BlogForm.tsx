"use client";
import { Blog } from "@/types";
import {
  adminCreateBlog,
  adminUpdateBlog,
  adminUploadCover,
  adminUploadImage,
  adminDeleteImage,
} from "@/lib/api";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import { AxiosError } from "axios";

const ACCEPTED_TYPES = ["image/jpeg", "image/png"];
const ACCEPT_ATTR = ".jpg,.jpeg,.png";
const MAX_IMAGES = 6;

function getErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof AxiosError) {
    const data = err.response?.data as { error?: string } | undefined;
    return data?.error ?? err.message ?? fallback;
  }
  return fallback;
}

function validateImageFile(file: File): string | null {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    return "รองรับเฉพาะไฟล์ .jpg หรือ .png เท่านั้น";
  }
  return null;
}

interface Props {
  blog?: Blog;
}

interface PendingImage {
  id: string; // local id for keying
  file: File;
  previewUrl: string;
}

export default function BlogForm({ blog }: Props) {
  const { data: session } = useSession();
  const router = useRouter();
  const isEdit = !!blog;

  const [title, setTitle] = useState(blog?.title ?? "");
  const [slug, setSlug] = useState(blog?.slug ?? "");
  const [excerpt, setExcerpt] = useState(blog?.excerpt ?? "");
  const [content, setContent] = useState(blog?.content ?? "");
  const [isPublished, setIsPublished] = useState(blog?.isPublished ?? false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Create mode: buffer files in state until blog exists
  const [pendingCover, setPendingCover] = useState<File | null>(null);
  const [pendingCoverPreview, setPendingCoverPreview] = useState<string | null>(null);
  const [pendingImages, setPendingImages] = useState<PendingImage[]>([]);

  // Revoke blob URLs when component unmounts or preview changes
  useEffect(() => {
    return () => {
      if (pendingCoverPreview) URL.revokeObjectURL(pendingCoverPreview);
    };
  }, [pendingCoverPreview]);

  useEffect(() => {
    return () => {
      pendingImages.forEach((img) => URL.revokeObjectURL(img.previewUrl));
    };
    // only cleanup on unmount — individual removals handle their own revoke
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const token = session?.accessToken ?? undefined;

  // ===== Create mode: local file handlers =====

  function handlePickCoverLocal(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow picking same file again
    if (!file) return;
    const err = validateImageFile(file);
    if (err) {
      setError(err);
      return;
    }
    setError("");
    if (pendingCoverPreview) URL.revokeObjectURL(pendingCoverPreview);
    setPendingCover(file);
    setPendingCoverPreview(URL.createObjectURL(file));
  }

  function handleRemoveCoverLocal() {
    if (pendingCoverPreview) URL.revokeObjectURL(pendingCoverPreview);
    setPendingCover(null);
    setPendingCoverPreview(null);
  }

  function handlePickImageLocal(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const err = validateImageFile(file);
    if (err) {
      setError(err);
      return;
    }
    if (pendingImages.length >= MAX_IMAGES) {
      setError(`อัพโหลดรูปได้สูงสุด ${MAX_IMAGES} รูป`);
      return;
    }
    setError("");
    setPendingImages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), file, previewUrl: URL.createObjectURL(file) },
    ]);
  }

  function handleRemoveImageLocal(id: string) {
    setPendingImages((prev) => {
      const target = prev.find((i) => i.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((i) => i.id !== id);
    });
  }

  // ===== Edit mode: direct upload handlers =====

  async function handleCoverUploadExisting(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!blog || !file) return;
    const err = validateImageFile(file);
    if (err) {
      setError(err);
      return;
    }
    try {
      setError("");
      await adminUploadCover(blog.id, file, token);
      router.refresh();
    } catch (err) {
      setError(getErrorMessage(err, "อัพโหลดรูปปกไม่สำเร็จ"));
    }
  }

  async function handleImageUploadExisting(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!blog || !file) return;
    const err = validateImageFile(file);
    if (err) {
      setError(err);
      return;
    }
    try {
      setError("");
      await adminUploadImage(blog.id, file, token);
      router.refresh();
    } catch (err) {
      setError(getErrorMessage(err, "อัพโหลดรูปไม่สำเร็จ"));
    }
  }

  async function handleDeleteImageExisting(imageId: string) {
    if (!blog) return;
    try {
      await adminDeleteImage(blog.id, imageId, token);
      router.refresh();
    } catch (err) {
      setError(getErrorMessage(err, "ลบรูปไม่สำเร็จ"));
    }
  }

  // ===== Submit =====

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const payload = { title, slug: slug || undefined, excerpt, content, isPublished };

      if (isEdit && blog) {
        await adminUpdateBlog(blog.id, payload, token);
      } else {
        // Create → upload cover → upload images (each failure reported but non-blocking)
        const created = await adminCreateBlog(payload, token);

        if (pendingCover) {
          try {
            await adminUploadCover(created.id, pendingCover, token);
          } catch (err) {
            console.warn("Cover upload failed:", err);
          }
        }

        for (const img of pendingImages) {
          try {
            await adminUploadImage(created.id, img.file, token);
          } catch (err) {
            console.warn("Image upload failed:", err);
          }
        }
      }

      router.push("/admin/blogs");
      router.refresh();
    } catch (err) {
      setError(getErrorMessage(err, "เกิดข้อผิดพลาด"));
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 focus:bg-white transition-all";

  // Unified view of cover image (either from server or local preview)
  const coverPreview = isEdit ? blog?.coverImage : pendingCoverPreview;
  const existingImages = blog?.images ?? [];
  const totalImages = isEdit ? existingImages.length : pendingImages.length;

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
      {/* Main content card */}
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-6 space-y-5">
        <h2 className="font-bold text-lg border-b border-zinc-100 pb-3">เนื้อหาบทความ</h2>

        <div>
          <label className="block text-sm font-medium mb-2 text-zinc-700">
            ชื่อบทความ <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="ตั้งชื่อบทความของคุณ"
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-zinc-700">
            URL Slug
            <span className="text-xs text-zinc-400 font-normal ml-2">(เว้นว่างเพื่อสร้างจากชื่อ)</span>
          </label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-zinc-400 font-mono">/blog/</span>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="auto-generated"
              className={`${inputClass} font-mono`}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-zinc-700">
            เนื้อหาย่อ <span className="text-red-500">*</span>
          </label>
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            required
            rows={2}
            placeholder="สรุปสั้นๆ สำหรับแสดงในหน้ารายการ"
            className={`${inputClass} resize-none`}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-zinc-700">
            เนื้อหา <span className="text-red-500">*</span>
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            rows={12}
            placeholder="เขียนเนื้อหาของคุณที่นี่..."
            className={`${inputClass} font-mono resize-y leading-relaxed`}
          />
        </div>
      </div>

      {/* Publish toggle */}
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-6">
        <label className="flex items-center justify-between cursor-pointer">
          <div>
            <div className="font-medium text-sm">เผยแพร่บทความ</div>
            <div className="text-xs text-zinc-500 mt-0.5">
              เมื่อเปิดใช้งาน บทความจะแสดงในหน้าเว็บสาธารณะ
            </div>
          </div>
          <div className="relative">
            <input
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-500/30 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all after:shadow peer-checked:bg-linear-to-r peer-checked:from-indigo-500 peer-checked:to-purple-600"></div>
          </div>
        </label>
      </div>

      {/* Images */}
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-6 space-y-6">
        <h2 className="font-bold text-lg border-b border-zinc-100 pb-3">รูปภาพ</h2>

        {/* Cover */}
        <div>
          <label className="block text-sm font-medium mb-3 text-zinc-700">
            รูปปก
            <span className="text-xs text-zinc-400 font-normal ml-2">(.jpg / .png)</span>
          </label>

          {coverPreview ? (
            <div className="relative h-48 w-72 rounded-xl overflow-hidden mb-3 shadow-sm border border-zinc-200 group">
              <Image src={coverPreview} alt="" fill sizes="288px" className="object-cover" />
              {!isEdit && (
                <button
                  type="button"
                  onClick={handleRemoveCoverLocal}
                  className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-7 h-7 text-sm flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ×
                </button>
              )}
            </div>
          ) : (
            <div className="h-48 w-72 rounded-xl border-2 border-dashed border-zinc-200 flex items-center justify-center bg-zinc-50 mb-3 text-zinc-400 text-sm">
              ยังไม่มีรูปปก
            </div>
          )}

          <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 cursor-pointer text-sm font-medium transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {coverPreview ? "เปลี่ยนรูปปก" : "อัพโหลดรูปปก"}
            <input
              type="file"
              accept={ACCEPT_ATTR}
              onChange={isEdit ? handleCoverUploadExisting : handlePickCoverLocal}
              className="hidden"
            />
          </label>
        </div>

        {/* Additional images */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-zinc-700">
              รูปเพิ่มเติม
              <span className="text-xs text-zinc-400 font-normal ml-2">(.jpg / .png)</span>
            </label>
            <span className="text-xs text-zinc-500">
              {totalImages} / {MAX_IMAGES}
            </span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-3">
            {isEdit
              ? existingImages.map((img) => (
                  <div key={img.id} className="relative group">
                    <div className="relative aspect-square rounded-lg overflow-hidden border border-zinc-200">
                      <Image src={img.url} alt="" fill sizes="80px" className="object-cover" />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteImageExisting(img.id)}
                      className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 text-xs flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                  </div>
                ))
              : pendingImages.map((img) => (
                  <div key={img.id} className="relative group">
                    <div className="relative aspect-square rounded-lg overflow-hidden border border-zinc-200">
                      <Image src={img.previewUrl} alt="" fill sizes="80px" className="object-cover" />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveImageLocal(img.id)}
                      className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 text-xs flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                  </div>
                ))}
          </div>

          {totalImages < MAX_IMAGES && (
            <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 cursor-pointer text-sm font-medium transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              เพิ่มรูป
              <input
                type="file"
                accept={ACCEPT_ATTR}
                onChange={isEdit ? handleImageUploadExisting : handlePickImageLocal}
                className="hidden"
              />
            </label>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600 text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-3 sticky bottom-4 bg-white/90 backdrop-blur-sm p-3 rounded-2xl border border-zinc-200 shadow-lg">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 sm:flex-initial bg-linear-to-r from-indigo-500 to-purple-600 text-white px-8 py-3 rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-indigo-500/30 disabled:opacity-50 transition-all"
        >
          {loading
            ? "กำลังบันทึก..."
            : isEdit
              ? "บันทึกการเปลี่ยนแปลง"
              : "สร้างบทความ"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-3 rounded-xl border border-zinc-200 text-sm font-medium bg-white hover:bg-zinc-50 transition-colors"
        >
          ยกเลิก
        </button>
      </div>
    </form>
  );
}
