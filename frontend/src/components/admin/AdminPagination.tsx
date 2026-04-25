import Link from "next/link";

interface Props {
  currentPage: number;
  totalPages: number;
  basePath: string;
  extraParams?: Record<string, string>;
}

export default function AdminPagination({ currentPage, totalPages, basePath, extraParams }: Props) {
  if (totalPages <= 1) return null;

  const buildHref = (page: number) => {
    const params = new URLSearchParams({ ...extraParams, page: String(page) });
    return `${basePath}?${params.toString()}`;
  };

  const btn = "min-w-[36px] h-9 px-3 inline-flex items-center justify-center rounded-lg text-sm font-medium transition-all";

  const pages: (number | "...")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push("...");
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) pages.push(i);
    if (currentPage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
  }

  return (
    <div className="flex items-center justify-center gap-1 mt-6">
      <Link
        href={buildHref(currentPage - 1)}
        aria-disabled={currentPage === 1}
        className={`${btn} ${currentPage === 1 ? "pointer-events-none opacity-30" : "bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50 shadow-sm"}`}
      >
        ←
      </Link>

      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`ellipsis-${i}`} className="px-1 text-zinc-400 text-sm select-none">
            …
          </span>
        ) : (
          <Link
            key={p}
            href={buildHref(p)}
            className={
              p === currentPage
                ? `${btn} bg-linear-to-r from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/30`
                : `${btn} bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50 shadow-sm`
            }
          >
            {p}
          </Link>
        )
      )}

      <Link
        href={buildHref(currentPage + 1)}
        aria-disabled={currentPage === totalPages}
        className={`${btn} ${currentPage === totalPages ? "pointer-events-none opacity-30" : "bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50 shadow-sm"}`}
      >
        →
      </Link>
    </div>
  );
}
