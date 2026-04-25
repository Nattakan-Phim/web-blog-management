import { auth } from "@/lib/auth";
import { adminGetBlogs } from "@/lib/api";
import Link from "next/link";
import AdminBlogActions from "@/components/admin/AdminBlogActions";
import AdminPagination from "@/components/admin/AdminPagination";
import { redirect } from "next/navigation";

interface Props {
  searchParams: Promise<{ page?: string }>;
}

export default async function AdminBlogsPage({ searchParams }: Props) {
  const session = await auth();
  if (!session?.accessToken) redirect("/admin/login");

  const params = await searchParams;
  const page = Number(params.page) || 1;

  const { data: blogs, meta } = await adminGetBlogs(page, session.accessToken);

  const publishedCount = meta.publishedCount ?? blogs.filter((b) => b.isPublished).length;
  const draftCount = meta.draftCount ?? blogs.filter((b) => !b.isPublished).length;

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">บทความทั้งหมด</h1>
          <p className="text-sm text-zinc-500">จัดการและแก้ไขบทความบนเว็บไซต์</p>
        </div>
        <Link
          href="/admin/blogs/new"
          className="inline-flex items-center gap-2 bg-linear-to-r from-indigo-500 to-purple-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-indigo-500/30 transition-all"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          เพิ่มบทความ
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-5 border border-zinc-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">ทั้งหมด</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
          <div className="text-2xl font-bold">{meta.total}</div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-zinc-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">เผยแพร่</span>
            <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center text-green-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <div className="text-2xl font-bold">{publishedCount}</div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-zinc-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">ฉบับร่าง</span>
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
          </div>
          <div className="text-2xl font-bold">{draftCount}</div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 border-b border-zinc-200">
            <tr>
              <th className="text-left px-6 py-4 font-semibold text-zinc-600 text-xs uppercase tracking-wider">ชื่อบทความ</th>
              <th className="text-left px-6 py-4 font-semibold text-zinc-600 text-xs uppercase tracking-wider">Slug</th>
              <th className="text-left px-6 py-4 font-semibold text-zinc-600 text-xs uppercase tracking-wider">สถานะ</th>
              <th className="text-left px-6 py-4 font-semibold text-zinc-600 text-xs uppercase tracking-wider">เข้าชม</th>
              <th className="text-left px-6 py-4 font-semibold text-zinc-600 text-xs uppercase tracking-wider">วันที่</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {blogs.map((blog) => (
              <tr key={blog.id} className="hover:bg-zinc-50 transition-colors">
                <td className="px-6 py-4 font-medium max-w-xs truncate">{blog.title}</td>
                <td className="px-6 py-4 text-zinc-500 font-mono text-xs max-w-xs truncate">{blog.slug}</td>
                <td className="px-6 py-4">
                  {blog.isPublished ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      Published
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-zinc-100 text-zinc-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
                      Draft
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-zinc-500">{blog.viewCount.toLocaleString()}</td>
                <td className="px-6 py-4 text-zinc-500">
                  {new Date(blog.publishedAt).toLocaleDateString("th-TH", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </td>
                <td className="px-6 py-4">
                  <AdminBlogActions blogId={blog.id} isPublished={blog.isPublished} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {blogs.length === 0 && (
          <div className="text-center py-16">
            <div className="text-5xl mb-3 opacity-30">📝</div>
            <p className="text-zinc-500 mb-4">ยังไม่มีบทความ</p>
            <Link
              href="/admin/blogs/new"
              className="inline-flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              สร้างบทความแรก →
            </Link>
          </div>
        )}
      </div>

      {meta.total > 0 && (
        <div className="mt-4 text-sm text-zinc-500 text-center">
          แสดง {blogs.length} จาก {meta.total} รายการ · หน้า {meta.page}/{meta.totalPages}
        </div>
      )}

      <AdminPagination
        currentPage={meta.page}
        totalPages={meta.totalPages}
        basePath="/admin/blogs"
      />
    </div>
  );
}
