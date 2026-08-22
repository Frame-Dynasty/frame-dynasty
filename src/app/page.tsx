import Link from "next/link";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

interface Frame {
  id: string;
  title: string;
  image_url: string;
}

export default async function HomePage() {
  let frames: Frame[] = [];
  try {
    frames = await query<Frame>(
      "SELECT id, title, image_url FROM frames ORDER BY created_at DESC LIMIT 4"
    );
  } catch {
    // DB not set up yet
  }

  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Video background — drop hero-video.mp4 in public/ */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/hero-video.mp4" type="video/mp4" />
          <source src="/hero-video.webm" type="video/webm" />
        </video>

        {/* Image fallback with Ken Burns — swap gradient for url('/hero.jpg') */}
        <div className="hero-bg animate-ken-burns" />
        <div className="hero-overlay" />

        {/* Content */}
        <div className="relative z-10 text-center px-6">
          <div className="mb-8 animate-frame-reveal">
            <img
              src="/logo.png"
              alt="Frame Dynasty"
              className="w-48 md:w-64 lg:w-80 mx-auto"
            />
          </div>

          <p className="font-[family-name:var(--font-montserrat)] text-white/60 text-lg md:text-xl max-w-xl mx-auto mb-12 animate-slide-up-delay-1">
            Frames that tell your story
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up-delay-2">
            <Link
              href="/exhibition"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg bg-orange text-white font-[family-name:var(--font-montserrat)] font-semibold hover:bg-orange-dark transition-colors duration-150 active:scale-[0.96]"
            >
              Benin Past Exhibition
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
            <Link
              href="/gallery"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg border border-gold/30 text-gold font-[family-name:var(--font-montserrat)] font-medium hover:border-gold/60 hover:bg-gold/5 transition-all duration-150 active:scale-[0.96]"
            >
              View Our Work
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce z-10">
          <svg className="w-6 h-6 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* Featured pieces */}
      {frames.length > 0 && (
        <section className="max-w-[var(--max-content-width)] mx-auto px-6 py-20">
          <h2 className="font-[family-name:var(--font-handorty)] text-3xl text-gold mb-8">
            Recent Pieces
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {frames.map((frame) => (
              <Link key={frame.id} href={`/f/${frame.id}`} className="group block">
                <div className="aspect-[3/4] overflow-hidden rounded-lg bg-white/5 mb-3">
                  <img
                    src={frame.image_url}
                    alt={frame.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                    loading="lazy"
                  />
                </div>
                <h3 className="font-[family-name:var(--font-montserrat)] text-sm text-white/60 group-hover:text-white transition-colors duration-150">
                  {frame.title}
                </h3>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-6">
        <div className="max-w-[var(--max-content-width)] mx-auto flex items-center justify-between">
          <img src="/logo.png" alt="Frame Dynasty" className="h-10" />
          <nav className="flex items-center gap-6 font-[family-name:var(--font-montserrat)] text-sm text-white/30">
            <Link href="/exhibition" className="hover:text-white/60 transition-colors duration-150">
              Exhibition
            </Link>
            <Link href="/gallery" className="hover:text-white/60 transition-colors duration-150">
              Gallery
            </Link>
          </nav>
        </div>
      </footer>
    </main>
  );
}
