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
      {/* Title */}
      <div className="px-6 pt-8 pb-4">
        <h1
          className="font-[family-name:var(--font-handorty)] text-2xl md:text-4xl text-white break-words"
          style={accentColor ? { color: accentColor } : undefined}
        >
          {title}
        </h1>
      </div>

      {/* Main image — full width */}
      <div className="relative w-full">
        <LazyImage
          src={mainImage}
          alt={title}
          blur={mainBlur}
          className="w-full"
          fetchPriority="high"
        />
      </div>

      {/* Supplement carousel — fixed height below main image */}
      {supplementImages.length > 0 && (
        <div className="px-6 py-6">
          <p className="text-white/40 text-xs font-[family-name:var(--font-montserrat)] mb-3 uppercase tracking-wider">
            Gallery ({supplementImages.length} more)
          </p>

          {/* Active supplement preview */}
          <div className="w-full h-64 md:h-80 rounded-xl overflow-hidden bg-white/5 mb-3">
            <LazyImage
              src={supplementImages[activeIndex]}
              alt={`${title} ${activeIndex + 2}`}
              className="w-full h-full"
              loading="lazy"
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
                <img src={url} alt="" className="w-full h-full object-cover" loading="lazy" />
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
