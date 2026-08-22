import { notFound } from "next/navigation";
import { queryOne, query } from "@/lib/db";
import ShareButton from "./share-button";
import VideoPlayer from "./video-player";
import ScanTracker from "./scan-tracker";
import Link from "next/link";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

interface Frame {
  id: string;
  title: string;
  story: string;
  image_url: string;
  credits: Record<string, string>;
  accent_color: string | null;
}

interface RelatedFrame {
  id: string;
  title: string;
  image_url: string;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const frame = await queryOne<Frame>(
    "SELECT id, title, story, image_url FROM frames WHERE id = $1",
    [id]
  );

  if (!frame) return { title: "Frame Not Found" };

  const excerpt = frame.story.slice(0, 120) + (frame.story.length > 120 ? "..." : "");

  return {
    title: `${frame.title} — Frame Dynasty`,
    description: excerpt,
    openGraph: {
      title: frame.title,
      description: excerpt,
      images: [{ url: frame.image_url, width: 1200, height: 630 }],
      url: `https://frame-dynasty.com/f/${frame.id}`,
      siteName: "Frame Dynasty",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: frame.title,
      description: excerpt,
      images: [frame.image_url],
    },
  };
}

export default async function FramePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const frame = await queryOne<Frame>(
    "SELECT id, title, story, image_url, credits, accent_color FROM frames WHERE id = $1",
    [id]
  );

  if (!frame) notFound();

  const credits: Record<string, string> = frame.credits || {};

  let related: RelatedFrame[] = [];
  try {
    related = await query<RelatedFrame>(
      "SELECT id, title, image_url FROM frames WHERE id != $1 ORDER BY created_at DESC LIMIT 4",
      [id]
    );
  } catch {}

  return (
    <main className="min-h-screen">
      <ScanTracker frameId={frame.id} />

      <section className="relative w-full h-[70vh] md:h-[85vh] animate-frame-reveal">
        <img
          src={frame.image_url}
          alt={frame.title}
          className="w-full h-full object-cover"
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent md:hidden" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:hidden">
          <h1
            className="font-[family-name:var(--font-handorty)] text-3xl text-gold animate-slide-up-delay-1"
            style={frame.accent_color ? { color: frame.accent_color } : undefined}
          >
            {frame.title}
          </h1>
        </div>
      </section>

      <section className="max-w-[var(--max-text-width)] mx-auto px-6 py-12 md:py-16">
        <h1
          className="hidden md:block font-[family-name:var(--font-handorty)] text-4xl lg:text-5xl text-gold mb-8 animate-slide-up-delay-1"
          style={frame.accent_color ? { color: frame.accent_color } : undefined}
        >
          {frame.title}
        </h1>

        <div className="animate-slide-up-delay-2">
          <div className="prose prose-invert prose-lg max-w-none">
            {frame.story.split("\n\n").map((paragraph, i) => (
              <p key={i} className="text-white/80 leading-relaxed text-base md:text-lg mb-6 font-[family-name:var(--font-montserrat)]">
                {paragraph}
              </p>
            ))}
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 animate-fade-in">
          <ShareButton frameId={frame.id} title={frame.title} />
          <a href="/gallery" className="group inline-flex items-center gap-2 text-orange hover:text-gold transition-colors duration-150 font-[family-name:var(--font-montserrat)] font-medium">
            Discover Frame Dynasty
            <svg className="w-4 h-4 transition-transform duration-150 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>

        {Object.keys(credits).length > 0 && (
          <div className="mt-8 pt-6 border-t border-white/5">
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              {Object.entries(credits).map(([role, name]) => (
                <span key={role} className="text-white/40 text-sm font-[family-name:var(--font-montserrat)]">
                  {role} by <span className="text-white/60">{name}</span>
                </span>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Coming soon video */}
      <section className="max-w-[var(--max-content-width)] mx-auto px-6 pb-16">
        <VideoPlayer />
      </section>

      {related.length > 0 && (
        <section className="max-w-[var(--max-content-width)] mx-auto px-6 pb-20">
          <h2 className="font-[family-name:var(--font-handorty)] text-2xl text-gold mb-6">More from Frame Dynasty</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {related.map((r) => (
              <Link key={r.id} href={`/f/${r.id}`} className="group block">
                <div className="aspect-[3/4] overflow-hidden rounded-lg bg-white/5 mb-3">
                  <img src={r.image_url} alt={r.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]" loading="lazy" />
                </div>
                <h3 className="font-[family-name:var(--font-montserrat)] text-sm text-white/60 group-hover:text-white transition-colors duration-150">
                  {r.title}
                </h3>
              </Link>
            ))}
          </div>
        </section>
      )}

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
