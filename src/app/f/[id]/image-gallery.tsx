"use client";

import { useState, useRef, useEffect } from "react";

interface ImageGalleryProps {
  mainImage: string;
  supplementImages: string[];
  title: string;
}

export default function ImageGallery({ mainImage, supplementImages, title }: ImageGalleryProps) {
  const [activeImage, setActiveImage] = useState(mainImage);
  const [loaded, setLoaded] = useState<Record<string, boolean>>({});
  const allImages = [mainImage, ...supplementImages];

  useEffect(() => {
    const img = new Image();
    img.src = mainImage;
    img.onload = () => setLoaded((prev) => ({ ...prev, [mainImage]: true }));
  }, [mainImage]);

  function handleSelect(url: string) {
    setActiveImage(url);
    if (!loaded[url]) {
      const img = new Image();
      img.src = url;
      img.onload = () => setLoaded((prev) => ({ ...prev, [url]: true }));
    }
  }

  return (
    <div>
      {/* Main image */}
      <div className="relative w-full h-[60vh] md:h-[80vh] overflow-hidden bg-white/5">
        {!loaded[activeImage] && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        <img
          src={activeImage}
          alt={title}
          className={`w-full h-full object-cover transition-opacity duration-300 ${loaded[activeImage] ? "opacity-100" : "opacity-0"}`}
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent md:hidden" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:hidden">
          <h1 className="font-[family-name:var(--font-handorty)] text-3xl text-gold animate-slide-up-delay-1">
            {title}
          </h1>
        </div>
      </div>

      {/* Thumbnail strip */}
      {supplementImages.length > 0 && (
        <div className="max-w-[var(--max-content-width)] mx-auto px-6 -mt-16 relative z-10 pb-4">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide py-2">
            {allImages.map((url, i) => (
              <button
                key={i}
                onClick={() => handleSelect(url)}
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
