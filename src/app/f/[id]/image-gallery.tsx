"use client";

import { useState } from "react";
import LazyImage from "@/components/lazy-image";

interface ImageGalleryProps {
  mainImage: string;
  mainBlur?: string;
  supplementImages: string[];
  title: string;
  accentColor?: string | null;
}

export default function ImageGallery({ mainImage, mainBlur, supplementImages, title, accentColor }: ImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="w-full">
      {/* Main image with title overlay */}
      <div className="relative w-full">
        <LazyImage
          src={mainImage}
          alt={title}
          blur={mainBlur}
          className="w-full"
          fetchPriority="high"
        />
        {/* Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent pointer-events-none" />
        {/* Title */}
        <div className="absolute bottom-0 left-0 right-0 p-5 md:p-8 z-10">
          <h1
            className="font-[family-name:var(--font-handorty)] text-2xl md:text-4xl text-white drop-shadow-[0_2px_16px_rgba(0,0,0,1)] break-words"
          >
            {title}
          </h1>
        </div>
      </div>

      {/* Supplement carousel */}
      {supplementImages.length > 0 && (
        <div className="px-6 py-6">
          <p className="text-white/40 text-xs font-[family-name:var(--font-montserrat)] mb-3 uppercase tracking-wider">
            Gallery ({supplementImages.length} more)
          </p>

          {/* Active supplement preview — fixed 16:9 aspect */}
          <div className="w-full aspect-video rounded-xl overflow-hidden bg-black/80 mb-3">
            <LazyImage
              src={supplementImages[activeIndex]}
              alt={`${title} ${activeIndex + 2}`}
              className="w-full h-full"
              loading="lazy"
              backdrop
            />
          </div>

          {/* Thumbnails */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
            {supplementImages.map((url, i) => (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                className={`flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-all duration-150 ${
                  activeIndex === i
                    ? "border-gold scale-105"
                    : "border-white/10 opacity-60 hover:opacity-100"
                }`}
              >
                <img src={url} alt="" className="w-full h-full object-contain bg-black/80" loading="lazy" />
              </button>
            ))}
          </div>

          {/* Dots */}
          <div className="flex gap-1.5 mt-3 justify-center">
            {supplementImages.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                className={`w-2 h-2 rounded-full transition-all ${
                  activeIndex === i ? "bg-gold w-5" : "bg-white/20"
                }`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
