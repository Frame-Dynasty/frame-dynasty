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
  const allImages = [mainImage, ...supplementImages];

  return (
    <div className="w-full">
      {/* Title — above the image */}
      <div className="max-w-[var(--max-text-width)] mx-auto px-6 pt-8 pb-4">
        <h1
          className="font-[family-name:var(--font-handorty)] text-2xl md:text-4xl text-white break-words"
          style={accentColor ? { color: accentColor } : undefined}
        >
          {title}
        </h1>
      </div>

      {/* Main image */}
      <div className="relative w-full">
        <LazyImage
          src={allImages[activeIndex]}
          alt={title}
          blur={activeIndex === 0 ? mainBlur : undefined}
          className="w-full"
          fetchPriority="high"
        />
      </div>

      {/* Carousel controls — below image */}
      {allImages.length > 1 && (
        <div className="max-w-[var(--max-content-width)] mx-auto px-6 py-4">
          {/* Thumbnails */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-3">
            {allImages.map((url, i) => (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                className={`flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden border-2 transition-all duration-150 ${
                  activeIndex === i
                    ? "border-gold scale-105 shadow-[0_0_12px_rgba(255,200,37,0.3)]"
                    : "border-white/10 opacity-60 hover:opacity-100 hover:border-white/30"
                }`}
              >
                <img
                  src={url}
                  alt={`${title} ${i + 1}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </button>
            ))}
          </div>

          {/* Dots + counter */}
          <div className="flex items-center justify-between">
            <div className="flex gap-1.5">
              {allImages.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveIndex(i)}
                  className={`w-2 h-2 rounded-full transition-all duration-200 ${
                    activeIndex === i ? "bg-gold w-6" : "bg-white/20 hover:bg-white/40"
                  }`}
                />
              ))}
            </div>
            <span className="text-white/40 text-xs font-[family-name:var(--font-montserrat)]">
              {activeIndex + 1} / {allImages.length}
            </span>
          </div>

          {/* Prev/Next arrows */}
          <div className="flex gap-3 mt-3">
            <button
              onClick={() => setActiveIndex((prev) => Math.max(0, prev - 1))}
              disabled={activeIndex === 0}
              className="flex-1 py-2.5 rounded-lg border border-white/10 text-white/60 text-sm font-[family-name:var(--font-montserrat)] hover:border-white/20 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setActiveIndex((prev) => Math.min(allImages.length - 1, prev + 1))}
              disabled={activeIndex === allImages.length - 1}
              className="flex-1 py-2.5 rounded-lg border border-white/10 text-white/60 text-sm font-[family-name:var(--font-montserrat)] hover:border-white/20 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
