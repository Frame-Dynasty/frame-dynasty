"use client";

import { useState, useRef, useEffect, useCallback } from "react";
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
  const [activeBlur, setActiveBlur] = useState(mainBlur);
  const allImages = [mainImage, ...supplementImages];
  const scrollRef = useRef<HTMLDivElement>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  const scrollTo = useCallback((index: number) => {
    const el = scrollRef.current;
    if (!el) return;
    const child = el.children[index] as HTMLElement;
    if (child) {
      child.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }
  }, []);

  const goNext = useCallback(() => {
    const next = Math.min(activeIndex + 1, allImages.length - 1);
    setActiveIndex(next);
    setActiveBlur(next === 0 ? mainBlur : undefined);
    scrollTo(next);
  }, [activeIndex, allImages.length, mainBlur, scrollTo]);

  const goPrev = useCallback(() => {
    const prev = Math.max(activeIndex - 1, 0);
    setActiveIndex(prev);
    setActiveBlur(prev === 0 ? mainBlur : undefined);
    scrollTo(prev);
  }, [activeIndex, mainBlur, scrollTo]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      const scrollLeft = el.scrollLeft;
      const width = el.offsetWidth;
      const idx = Math.round(scrollLeft / width);
      if (idx !== activeIndex) {
        setActiveIndex(idx);
        setActiveBlur(idx === 0 ? mainBlur : undefined);
      }
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [activeIndex, mainBlur]);

  function handleTouchStart(e: React.TouchEvent) {
    setTouchStart(e.touches[0].clientX);
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStart === null) return;
    const diff = touchStart - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) goNext();
      else goPrev();
    }
    setTouchStart(null);
  }

  return (
    <div className="w-full relative">
      {/* Carousel scroll container */}
      <div
        ref={scrollRef}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
      >
        {allImages.map((url, i) => (
          <div key={i} className="flex-shrink-0 w-full snap-center relative">
            <LazyImage
              src={url}
              alt={`${title} ${i + 1}`}
              blur={i === 0 ? mainBlur : undefined}
              className="w-full"
              fetchPriority={i === 0 ? "high" : "low"}
              loading={i === 0 ? "eager" : "lazy"}
            />
          </div>
        ))}
      </div>

      {/* Dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent pointer-events-none" />

      {/* Title */}
      <div className="absolute bottom-0 left-0 right-0 p-5 md:p-10 z-10">
        <h1
          className="font-[family-name:var(--font-handorty)] text-2xl md:text-4xl text-white drop-shadow-[0_2px_16px_rgba(0,0,0,1)] break-words"
          style={accentColor ? { color: accentColor } : undefined}
        >
          {title}
        </h1>
      </div>

      {/* Navigation arrows (desktop) */}
      {allImages.length > 1 && (
        <>
          {activeIndex > 0 && (
            <button
              onClick={goPrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 text-white/70 hover:text-white hover:bg-black/60 transition-all hidden md:flex items-center justify-center"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          {activeIndex < allImages.length - 1 && (
            <button
              onClick={goNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 text-white/70 hover:text-white hover:bg-black/60 transition-all hidden md:flex items-center justify-center"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </>
      )}

      {/* Dot indicators */}
      {allImages.length > 1 && (
        <div className="absolute bottom-20 left-0 right-0 z-10 flex justify-center gap-1.5">
          {allImages.map((_, i) => (
            <button
              key={i}
              onClick={() => { setActiveIndex(i); scrollTo(i); setActiveBlur(i === 0 ? mainBlur : undefined); }}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                activeIndex === i ? "bg-gold w-6" : "bg-white/30 hover:bg-white/50"
              }`}
            />
          ))}
        </div>
      )}

      {/* Image counter */}
      {allImages.length > 1 && (
        <div className="absolute top-4 right-4 z-10 bg-black/40 backdrop-blur-sm rounded-full px-3 py-1 border border-white/10">
          <span className="text-white/70 text-xs font-[family-name:var(--font-montserrat)]">
            {activeIndex + 1} / {allImages.length}
          </span>
        </div>
      )}
    </div>
  );
}
