"use client";
import { adminDeleteBlog, adminUpdateBlog } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";

interface Props {
  blogId: string;
  isPublished: boolean;
}

export default function AdminBlogActions({ blogId, isPublished }: Props) {
  const router = useRouter();
  const { data: session } = useSession();

  const token = session?.accessToken ?? undefined;

  async function handleTogglePublish() {
    await adminUpdateBlog(blogId, { isPublished: !isPublished }, token);
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm("ต้องการลบบทความนี้?")) return;
    await adminDeleteBlog(blogId, token);
    router.refresh();
  }

  const btnBase = "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors";

  return (
    <div className="flex items-center gap-1.5 justify-end">
      <Link
        href={`/admin/blogs/${blogId}/edit`}
        className={`${btnBase} text-indigo-600 hover:bg-indigo-50`}
      >
        แก้ไข
      </Link>
      <button
        onClick={handleTogglePublish}
        className={`${btnBase} text-zinc-600 hover:bg-zinc-100`}
      >
        {isPublished ? "Unpublish" : "Publish"}
      </button>
      <button
        onClick={handleDelete}
        className={`${btnBase} text-red-500 hover:bg-red-50`}
      >
        ลบ
      </button>
    </div>
  );
}
