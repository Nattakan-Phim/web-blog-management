import { auth } from "@/lib/auth";
import Link from "next/link";

export default async function Navbar() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-xl border-b border-zinc-200/60">
      <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/blog" className="flex items-center gap-2 group">
          <span className="w-8 h-8 rounded-lg bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-sm group-hover:shadow-md transition-shadow">
            B
          </span>
          <span className="text-lg font-bold tracking-tight">Blog</span>
        </Link>

        <nav className="flex items-center gap-1">
          <Link
            href="/blog"
            className="px-4 py-2 rounded-lg text-sm font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
          >
            บทความ
          </Link>

          {session ? (
            <Link
              href="/admin/blogs"
              className="ml-2 px-4 py-2 rounded-lg text-sm font-medium bg-zinc-900 text-white hover:bg-zinc-700 transition-colors shadow-sm"
            >
              Admin Panel
            </Link>
          ) : (
            <Link
              href="/admin/login"
              className="ml-2 px-4 py-2 rounded-lg text-sm font-medium bg-linear-to-r from-indigo-500 to-purple-600 text-white hover:shadow-lg hover:shadow-indigo-500/30 transition-all shadow-sm"
            >
              เข้าสู่ระบบ
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
