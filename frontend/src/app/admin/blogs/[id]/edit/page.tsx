import { auth } from "@/lib/auth";
import { adminGetBlogById } from "@/lib/api";
import { redirect } from "next/navigation";
import BlogForm from "@/components/admin/BlogForm";
import Link from "next/link";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditBlogPage({ params }: Props) {
  const { id } = await params;
  const session = await auth();
  if (!session?.accessToken) redirect("/admin/login");

  let blog;
  try {
    blog = await adminGetBlogById(id, session.accessToken);
  } catch {
    notFound();
  }

  return (
    <div className="animate-fade-in">
      <Link
        href="/admin/blogs"
        className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-indigo-600 mb-6 transition-colors group"
      >
        <span className="group-hover:-translate-x-1 transition-transform">←</span>
        กลับหน้าบทความ
      </Link>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-1">แก้ไขบทความ</h1>
        <p className="text-sm text-zinc-500 truncate">{blog.title}</p>
      </div>
      <BlogForm blog={blog} />
    </div>
  );
}
