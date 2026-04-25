import { auth } from "@/lib/auth";
import Link from "next/link";
import SessionProviderWrapper from "@/components/admin/SessionProviderWrapper";
import { signOutAction } from "./actions";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  // Login page or missing token: render without the admin shell
  if (!session?.accessToken) {
    return <SessionProviderWrapper>{children}</SessionProviderWrapper>;
  }

  return (
    <SessionProviderWrapper>
      <div className="min-h-screen flex bg-zinc-50">
        <aside className="w-64 bg-white border-r border-zinc-200 flex flex-col sticky top-0 h-screen">
          <div className="p-6 border-b border-zinc-100">
            <Link href="/blog" className="flex items-center gap-2 mb-5 group">
              <span className="w-9 h-9 rounded-xl bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-sm group-hover:shadow-md transition-shadow">
                B
              </span>
              <span className="text-lg font-bold tracking-tight">Blog Admin</span>
            </Link>
            <div className="flex items-center gap-3 p-3 bg-zinc-50 rounded-xl">
              <div className="w-9 h-9 rounded-full bg-linear-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-semibold text-sm shrink-0">
                {session.user?.email?.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-medium text-zinc-900 truncate">
                  {session.user?.email}
                </div>
                <div className="text-xs text-zinc-500">Administrator</div>
              </div>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            <Link
              href="/admin/blogs"
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              บทความ
            </Link>
            <Link
              href="/admin/comments"
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              ความคิดเห็น
            </Link>
          </nav>

          <div className="p-4 border-t border-zinc-100">
            <form action={signOutAction}>
              <button
                type="submit"
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-zinc-600 hover:bg-red-50 hover:text-red-600 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                ออกจากระบบ
              </button>
            </form>
          </div>
        </aside>
        <main className="flex-1 p-10 overflow-auto">{children}</main>
      </div>
    </SessionProviderWrapper>
  );
}
