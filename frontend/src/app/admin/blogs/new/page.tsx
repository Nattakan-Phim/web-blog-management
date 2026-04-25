import BlogForm from "@/components/admin/BlogForm";
import Link from "next/link";

export default function NewBlogPage() {
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
        <h1 className="text-3xl font-bold tracking-tight mb-1">เพิ่มบทความใหม่</h1>
        <p className="text-sm text-zinc-500">สร้างบทความและเตรียมพร้อมสำหรับการเผยแพร่</p>
      </div>
      <BlogForm />
    </div>
  );
}
