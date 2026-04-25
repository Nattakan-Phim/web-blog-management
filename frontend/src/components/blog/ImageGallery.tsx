"use client";
import { BlogImage } from "@/types";
import Image from "next/image";
import { useState } from "react";

export default function ImageGallery({ images }: { images: BlogImage[] }) {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <>
      <div className="grid grid-cols-3 gap-2">
        {images.map((img) => (
          <button key={img.id} onClick={() => setSelected(img.url)} className="relative aspect-square rounded-lg overflow-hidden">
            <Image
              src={img.url}
              alt=""
              fill
              sizes="(max-width: 768px) 33vw, 250px"
              className="object-cover hover:opacity-90 transition-opacity"
            />
          </button>
        ))}
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center" onClick={() => setSelected(null)}>
          <div className="relative w-full max-w-2xl max-h-[80vh] aspect-video">
            <Image src={selected} alt="" fill sizes="100vw" className="object-contain" />
          </div>
        </div>
      )}
    </>
  );
}
