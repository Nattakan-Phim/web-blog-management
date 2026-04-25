import Link from "next/link";

interface Props {
  currentPage: number;
  totalPages: number;
  search?: string;
}

export default function Pagination({ currentPage, totalPages, search }: Props) {
  const buildHref = (page: number) => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    if (search) params.set("search", search);
    return `/blog?${params.toString()}`;
  };

  const pageBtn = "min-w-[40px] h-10 px-3 inline-flex items-center justify-center rounded-lg text-sm font-medium transition-all";

  return (
    <div className="flex items-center justify-center gap-1.5">
      {currentPage > 1 && (
        <Link
          href={buildHref(currentPage - 1)}
          className={`${pageBtn} bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50 shadow-sm`}
        >
          ←
        </Link>
      )}

      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <Link
          key={page}
          href={buildHref(page)}
          className={
            page === currentPage
              ? `${pageBtn} bg-linear-to-r from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/30`
              : `${pageBtn} bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50 shadow-sm`
          }
        >
          {page}
        </Link>
      ))}

      {currentPage < totalPages && (
        <Link
          href={buildHref(currentPage + 1)}
          className={`${pageBtn} bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50 shadow-sm`}
        >
          →
        </Link>
      )}
    </div>
  );
}
