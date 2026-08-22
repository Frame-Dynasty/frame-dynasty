"use client";

import { useState } from "react";
import LazyImage from "@/components/lazy-image";

interface ImageGalleryProps {
  mainImage: string;
  mainBlur?: string;
  supplementImages: string[];
  title: string;
}

export default function ImageGallery({ mainImage, mainBlur, supplementImages, title }: ImageGalleryProps) {
  const [activeImage, setActiveImage] = useState(mainImage);
  const [activeBlur, setActiveBlur] = useState(mainBlur);
  const allImages = [mainImage, ...supplementImages];

  return (
    <div>
      {/* Main image */}
      <LazyImage
        src={activeImage}
        alt={title}
        blur={activeBlur}
        className="w-full h-[60vh] md:h-[80vh]"
        fetchPriority="high"
      />

      {/* Thumbnail strip */}
      {supplementImages.length > 0 && (
        <div className="max-w-[var(--max-content-width)] mx-auto px-6 -mt-16 relative z-10 pb-4">
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
