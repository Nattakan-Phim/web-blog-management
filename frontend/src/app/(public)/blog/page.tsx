import type { Metadata } from "next";
import { getBlogs } from "@/lib/api";
import BlogCard from "@/components/blog/BlogCard";
import Pagination from "@/components/ui/Pagination";
import SearchInput from "@/components/ui/SearchInput";

export const metadata: Metadata = {
  title: "บทความทั้งหมด",
  description: "รวบรวมเรื่องราวและความรู้ที่น่าสนใจ",
  openGraph: {
    title: "บทความทั้งหมด",
    description: "รวบรวมเรื่องราวและความรู้ที่น่าสนใจ",
    type: "website",
    url: "/blog",
  },
};

interface Props {
  searchParams: Promise<{ page?: string; search?: string }>;
}

export default async function BlogListPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const search = params.search || "";

  const { data: blogs, meta } = await getBlogs(page, search);

  return (
    <main className="max-w-5xl mx-auto px-6 py-16 animate-fade-in">
      <div className="mb-12 text-center">
        <h1 className="text-5xl font-bold tracking-tight mb-3 bg-linear-to-r from-zinc-900 via-indigo-900 to-purple-900 bg-clip-text text-transparent">
          บทความทั้งหมด
        </h1>
        <p className="text-zinc-500 text-lg">
          รวบรวมเรื่องราวและความรู้ที่น่าสนใจ
        </p>
      </div>

      <div className="max-w-xl mx-auto mb-12">
        <SearchInput defaultValue={search} />
      </div>

      {blogs.length === 0 ? (
        <div className="text-center py-32">
          <div className="text-6xl mb-4 opacity-30">🔍</div>
          <p className="text-zinc-500 text-lg">ไม่พบบทความ</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {blogs.map((blog) => (
            <BlogCard key={blog.id} blog={blog} />
          ))}
        </div>
      )}

      {meta.totalPages > 1 && (
        <div className="mt-16">
          <Pagination currentPage={meta.page} totalPages={meta.totalPages} search={search} />
        </div>
      )}
    </main>
  );
}
