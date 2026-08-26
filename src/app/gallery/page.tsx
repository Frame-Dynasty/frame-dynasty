import Link from "next/link";
import { query } from "@/lib/db";

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
}

export default async function GalleryPage() {
  const frames = await query<Frame>(
    "SELECT id, title, image_url FROM frames ORDER BY created_at DESC LIMIT 12"
  );

  const resolved = frames.map((f) => ({
    ...f,
    image_url: resolveUrl(f.image_url),
  }));

  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="border-b border-white/5">
        <div className="max-w-[var(--max-content-width)] mx-auto px-6 py-5 flex items-center justify-between">
          <Link
            href="/"
            className="hover:opacity-80 transition-opacity duration-150"
          >
            <img src="/logo.png" alt="Frame Dynasty" className="h-10" />
          </Link>
          <nav className="flex items-center gap-6 font-[family-name:var(--font-montserrat)] text-sm">
            <Link
              href="/exhibition"
              className="text-white/60 hover:text-white transition-colors duration-150"
            >
              Exhibition
            </Link>
            <Link
              href="/gallery"
              className="text-white/60 hover:text-white transition-colors duration-150"
            >
              Gallery
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-[var(--max-content-width)] mx-auto px-6 pt-16 pb-12">
        <h1 className="font-[family-name:var(--font-handorty)] text-4xl md:text-5xl text-gold mb-4">
          Our Work
        </h1>
        <p className="text-white/60 font-[family-name:var(--font-montserrat)] text-lg max-w-2xl">
          Frame Dynasty crafts frames that carry stories. Every piece is built
          to honour the art it holds.
        </p>
      </section>

      {/* Gallery grid */}
      <section className="max-w-[var(--max-content-width)] mx-auto px-6 pb-12">
        {resolved.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-white/40 font-[family-name:var(--font-montserrat)]">
              Gallery coming soon.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {resolved.map((frame) => (
              <Link
                key={frame.id}
                href={`/f/${frame.id}`}
                className="group block"
              >
                <div className="aspect-square overflow-hidden rounded-lg bg-white/5 mb-2">
                  <img
                    src={frame.image_url}
                    alt={frame.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                    loading="lazy"
                  />
                </div>
                <h3 className="font-[family-name:var(--font-montserrat)] text-sm text-white/60 group-hover:text-white transition-colors duration-150 truncate">
                  {frame.title}
                </h3>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="max-w-[var(--max-content-width)] mx-auto px-6 pb-20">
        <div className="rounded-2xl bg-gradient-to-br from-gold/10 to-orange/10 border border-gold/20 p-8 md:p-12 text-center">
          <h2 className="font-[family-name:var(--font-handorty)] text-2xl md:text-3xl text-gold mb-3">
            Enquire About a Frame
          </h2>
          <p className="text-white/60 font-[family-name:var(--font-montserrat)] mb-6 max-w-lg mx-auto">
            Have a piece that deserves a frame worth having? We&apos;d love to
            hear from you.
          </p>
          <a
            href="https://linktr.ee/framedynasty"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-orange text-white font-[family-name:var(--font-montserrat)] font-medium hover:bg-orange-dark transition-colors duration-150 active:scale-[0.96]"
          >
            Get in Touch
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-6">
        <div className="max-w-[var(--max-content-width)] mx-auto flex items-center justify-between">
          <img src="/logo.png" alt="Frame Dynasty" className="h-8" />
          <span className="text-white/30 text-sm font-[family-name:var(--font-montserrat)]">
            &copy; {new Date().getFullYear()}
          </span>
        </div>
        <div className="text-center mt-6 text-xs font-[family-name:var(--font-montserrat)] text-white/20">
          Website built by <a href="https://wa.me/2349066973845?text=Hi%20Apostle%2C%20I%20visited%20Frame%20Dynasty%20website%20and%20would%20love%20to%20connect!" target="_blank" rel="noopener noreferrer" className="text-gold hover:text-gold-dark transition-colors">#Apostle</a>
        </div>
      </footer>
    </main>
  );
}
