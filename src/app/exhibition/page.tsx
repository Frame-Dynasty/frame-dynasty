import Link from "next/link";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

interface Frame {
  id: string;
  title: string;
  image_url: string;
}

export default async function ExhibitionPage() {
  const frames = await query<Frame>(
    "SELECT id, title, image_url FROM frames ORDER BY created_at DESC"
  );

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
          Benin Past
        </h1>
        <p className="text-white/60 font-[family-name:var(--font-montserrat)] text-lg max-w-2xl">
          A collection of framed pieces exploring the rich history and culture
          of the Benin Kingdom. Each piece carries a story.
        </p>
      </section>

      {/* Grid */}
      <section className="max-w-[var(--max-content-width)] mx-auto px-6 pb-20">
        {frames.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-white/40 font-[family-name:var(--font-montserrat)]">
              No pieces in the exhibition yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {frames.map((frame) => (
              <Link
                key={frame.id}
                href={`/f/${frame.id}`}
                className="group block"
              >
                <div className="aspect-[4/3] overflow-hidden rounded-lg bg-white/5 mb-3">
                  <img
                    src={frame.image_url}
                    alt={frame.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                    loading="lazy"
                  />
                </div>
                <h2 className="font-[family-name:var(--font-montserrat)] font-medium text-white/80 group-hover:text-white transition-colors duration-150">
                  {frame.title}
                </h2>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-6">
        <div className="max-w-[var(--max-content-width)] mx-auto flex items-center justify-between">
          <img src="/logo.png" alt="Frame Dynasty" className="h-8" />
          <span className="text-white/30 text-sm font-[family-name:var(--font-montserrat)]">
            &copy; {new Date().getFullYear()}
          </span>
        </div>
      </footer>
    </main>
  );
}
