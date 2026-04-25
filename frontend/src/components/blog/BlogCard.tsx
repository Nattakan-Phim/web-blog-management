import { Blog } from "@/types";
import Image from "next/image";
import Link from "next/link";

export default function BlogCard({ blog }: { blog: Blog }) {
  return (
    <Link
      href={`/blog/${blog.slug}`}
      className="group block rounded-2xl bg-white border border-zinc-200/80 hover:border-zinc-300 shadow-sm hover:shadow-xl hover:shadow-zinc-200/50 transition-all duration-300 overflow-hidden hover:-translate-y-1"
    >
      {blog.coverImage ? (
        <div className="relative h-52 w-full overflow-hidden bg-zinc-100">
          <Image
            src={blog.coverImage}
            alt={blog.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
      ) : (
        <div className="h-52 w-full bg-linear-to-br from-indigo-100 via-purple-100 to-pink-100 flex items-center justify-center">
          <span className="text-5xl opacity-40">📝</span>
        </div>
      )}

      <div className="p-5">
        <h2 className="text-lg font-bold tracking-tight line-clamp-2 mb-2 group-hover:text-indigo-600 transition-colors">
          {blog.title}
        </h2>
        <p className="text-sm text-zinc-500 line-clamp-2 mb-4 leading-relaxed">
          {blog.excerpt}
        </p>
        <div className="flex items-center justify-between text-xs text-zinc-400">
          <time>
            {new Date(blog.publishedAt).toLocaleDateString("th-TH", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </time>
          <span className="inline-flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            {blog.viewCount}
          </span>
        </div>
      </div>
    </Link>
  );
}
