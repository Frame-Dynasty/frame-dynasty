"use client";

import { useState, useRef, useCallback } from "react";
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
  const touchStartX = useRef(0);

  const goNext = useCallback(() => {
    setActiveIndex((i) => Math.min(i + 1, supplementImages.length - 1));
  }, [supplementImages.length]);

  const goPrev = useCallback(() => {
    setActiveIndex((i) => Math.max(i - 1, 0));
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) < 50) return;
    if (diff > 0) goNext();
    else goPrev();
  }, [goNext, goPrev]);

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

          {/* Sliding preview with arrows */}
          <div className="relative group mb-3">
            <div
              className="w-full aspect-video rounded-xl overflow-hidden bg-black/80 touch-pan-y"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              <div
                className="flex w-full h-full transition-transform duration-300 ease-out"
                style={{ transform: `translateX(-${activeIndex * 100}%)` }}
              >
                {supplementImages.map((url, i) => (
                  <div key={i} className="flex-shrink-0 w-full h-full">
                    <LazyImage
                      src={url}
                      alt={`${title} ${i + 2}`}
                      className="w-full h-full"
                      loading="lazy"
                      backdrop
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Arrows — only show if more than 1 image */}
            {supplementImages.length > 1 && (
              <>
                <button
                  onClick={goPrev}
                  disabled={activeIndex === 0}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-black/70 transition-all disabled:opacity-0 disabled:pointer-events-none opacity-0 group-hover:opacity-100"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={goNext}
                  disabled={activeIndex === supplementImages.length - 1}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-black/70 transition-all disabled:opacity-0 disabled:pointer-events-none opacity-0 group-hover:opacity-100"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}
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
