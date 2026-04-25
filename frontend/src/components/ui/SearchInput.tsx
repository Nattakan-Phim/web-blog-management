"use client";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";

export default function SearchInput({ defaultValue = "" }: { defaultValue?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [value, setValue] = useState(defaultValue);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (value) params.set("search", value);
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <form onSubmit={handleSubmit} className="relative group">
      <svg
        className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 group-focus-within:text-indigo-500 transition-colors"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="ค้นหาบทความ..."
        className="w-full bg-white border border-zinc-200 rounded-full pl-12 pr-32 py-3.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
      />
      <button
        type="submit"
        className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-linear-to-r from-indigo-500 to-purple-600 text-white px-5 py-2 rounded-full text-sm font-medium hover:shadow-lg hover:shadow-indigo-500/30 transition-all"
      >
        ค้นหา
      </button>
    </form>
  );
}
