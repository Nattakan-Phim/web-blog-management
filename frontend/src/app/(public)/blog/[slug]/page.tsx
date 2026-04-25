import type { Metadata } from "next";
import { getBlogBySlug } from "@/lib/api";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import CommentSection from "@/components/blog/CommentSection";
import ImageGallery from "@/components/blog/ImageGallery";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const blog = await getBlogBySlug(slug);
    return {
      title: blog.title,
      description: blog.excerpt,
      openGraph: {
        title: blog.title,
        description: blog.excerpt,
        type: "article",
        url: `/blog/${slug}`,
        publishedTime: blog.publishedAt,
        modifiedTime: blog.updatedAt,
        ...(blog.coverImage && {
          images: [{ url: blog.coverImage, alt: blog.title }],
        }),
      },
      twitter: {
        card: "summary_large_image",
        title: blog.title,
        description: blog.excerpt,
        ...(blog.coverImage && { images: [blog.coverImage] }),
      },
    };
  } catch {
    return { title: "ไม่พบบทความ" };
  }
}

export default async function BlogDetailPage({ params }: Props) {
  const { slug } = await params;

  let blog;
  try {
    blog = await getBlogBySlug(slug);
  } catch {
    notFound();
  }

  return (
    <article className="max-w-3xl mx-auto px-6 py-12 animate-fade-in">
      <Link
        href="/blog"
        className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-indigo-600 mb-8 transition-colors group"
      >
        <span className="group-hover:-translate-x-1 transition-transform">←</span>
        กลับหน้าหลัก
      </Link>

      {blog.coverImage && (
        <div className="relative w-full h-112 rounded-3xl overflow-hidden mb-10 shadow-xl shadow-zinc-200/60">
          <Image
            src={blog.coverImage}
            alt={blog.title}
            fill
            sizes="(max-width: 768px) 100vw, 768px"
            className="object-cover"
            priority
          />
        </div>
      )}

      <header className="mb-10">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-5 leading-tight">
          {blog.title}
        </h1>
        <div className="flex items-center gap-4 text-sm text-zinc-500">
          <time className="inline-flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {new Date(blog.publishedAt).toLocaleDateString("th-TH", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
          <span className="w-1 h-1 rounded-full bg-zinc-300" />
          <span className="inline-flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            {blog.viewCount.toLocaleString()} ครั้ง
          </span>
        </div>
      </header>

      <p className="text-xl text-zinc-600 leading-relaxed mb-10 font-light">
        {blog.excerpt}
      </p>

      <div
        className="prose prose-lg max-w-none mb-12"
        dangerouslySetInnerHTML={{ __html: blog.content }}
      />

      {blog.images?.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 tracking-tight">แกลเลอรี</h2>
          <ImageGallery images={blog.images} />
        </section>
      )}

      <div className="border-t border-zinc-200 pt-12">
        <CommentSection blogId={blog.id} comments={blog.comments ?? []} />
      </div>
    </article>
  );
}
