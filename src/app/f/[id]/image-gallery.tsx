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
  const [activeImage, setActiveImage] = useState(mainImage);
  const [activeBlur, setActiveBlur] = useState(mainBlur);
  const allImages = [mainImage, ...supplementImages];

  return (
    <div className="-mx-0">
      {/* Main image — full viewport on mobile */}
      <div className="relative w-full h-[100svh] md:h-[85vh]">
        <LazyImage
          src={activeImage}
          alt={title}
          blur={activeBlur}
          className="w-full h-full"
          fetchPriority="high"
        />

        {/* Dark gradient at bottom with title */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 p-5 md:p-10">
          <h1
            className="font-[family-name:var(--font-handorty)] text-3xl md:text-5xl text-gold drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]"
            style={accentColor ? { color: accentColor } : undefined}
          >
            {title}
          </h1>
        </div>
      </div>

      {/* Thumbnail strip */}
      {supplementImages.length > 0 && (
        <div className="max-w-[var(--max-content-width)] mx-auto px-6 -mt-10 relative z-10 pb-4">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide py-2">
            {allImages.map((url, i) => (
              <button
                key={i}
                onClick={() => { setActiveImage(url); setActiveBlur(i === 0 ? mainBlur : undefined); }}
                className={`flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden border-2 transition-all duration-150 ${
                  activeImage === url
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
        </div>
      )}
    </div>
  );
}
