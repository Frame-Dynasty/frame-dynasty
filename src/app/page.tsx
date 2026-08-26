import Link from "next/link";
import { query } from "@/lib/db";
import LazyImage from "@/components/lazy-image";

export const dynamic = "force-dynamic";

const R2_PUBLIC = "https://pub-6ff7acfeb6774783bdea82b8fa66e289.r2.dev";

function resolveUrl(path: string | null): string {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${R2_PUBLIC}${path}`;
}

interface Frame {
  id: string;
  title: string;
  image_url: string;
  blur_data: string | null;
}

export default async function HomePage() {
  let frames: Frame[] = [];
  try {
    frames = await query<Frame>(
      "SELECT id, title, image_url, blur_data FROM frames ORDER BY created_at DESC LIMIT 4"
    );
  } catch {
    // DB not set up yet
  }

  const resolved = frames.map((f) => ({
    ...f,
    image_url: resolveUrl(f.image_url),
    blur_data: resolveUrl(f.blur_data),
  }));

  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="hero-bg animate-ken-burns" />

        {/* Content */}
        <div className="relative z-10 text-center px-6">
          <div className="mb-8 animate-frame-reveal">
            <img
              src="/logo.png"
              alt="Frame Dynasty"
              className="w-48 md:w-64 lg:w-80 mx-auto drop-shadow-[0_4px_24px_rgba(0,0,0,0.6)]"
            />
          </div>
<h1 className="font-[family-name:var(--font-handorty)] text-4xl md:text-6xl lg:text-7xl text-white mb-12 animate-slide-up-delay-1 drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)] tracking-wider">
  Frames That Tell Your Story
</h1>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up-delay-2">
            <Link
              href="/exhibition"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg bg-gold text-black font-[family-name:var(--font-montserrat)] font-semibold hover:bg-gold-dark transition-colors duration-150 active:scale-[0.96] shadow-[0_4px_20px_rgba(255,200,37,0.25)]"
            >
              View our exhibitions
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
            <Link
              href="/gallery"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg border border-white/20 text-white font-[family-name:var(--font-montserrat)] font-medium hover:border-white/40 hover:bg-white/5 transition-all duration-150 active:scale-[0.96]"
            >
              Explore gallery
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
      {resolved.length > 0 && (
        <section className="max-w-[var(--max-content-width)] mx-auto px-6 py-20">
          <h2 className="font-[family-name:var(--font-handorty)] text-3xl text-gold mb-8">
            Recent Pieces
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {resolved.map((frame) => (
              <Link key={frame.id} href={`/f/${frame.id}`} className="group block">
                <div className="aspect-[3/4] overflow-hidden rounded-lg bg-white/5 mb-3">
                  <LazyImage
                    src={frame.image_url}
                    alt={frame.title}
                    blur={frame.blur_data || undefined}
                    className="w-full h-full"
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
        <div className="text-center mt-6 text-xs font-[family-name:var(--font-montserrat)] text-white/20">
          Website built by <a href="https://wa.me/2349066973845?text=Hi%20Apostle%2C%20I%20visited%20Frame%20Dynasty%20website%20and%20would%20love%20to%20connect!" target="_blank" rel="noopener noreferrer" className="text-gold hover:text-gold-dark transition-colors">#Apostle</a>
        </div>
      </footer>
    </main>
  );
}
