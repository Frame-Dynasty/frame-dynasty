import { notFound } from "next/navigation";
import { queryOne, query } from "@/lib/db";
import ShareButton from "./share-button";
import VideoPlayer from "./video-player";
import ScanTracker from "./scan-tracker";
import ImageGallery from "./image-gallery";
import LazyImage from "@/components/lazy-image";
import AudioPlayer from "@/components/audio-player";
import Link from "next/link";
import type { Metadata } from "next";

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
  story: string;
  image_url: string;
  blur_data: string | null;
  audio_url: string | null;
  supplement_images: string[];
  credits: Record<string, string | { name: string; url?: string }>;
  accent_color: string | null;
}

interface RelatedFrame {
  id: string;
  title: string;
  image_url: string;
  blur_data: string | null;
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
      url: `https://framedynasty.com.ng/f/${frame.id}`,
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
    "SELECT id, title, story, image_url, blur_data, audio_url, supplement_images, credits, accent_color FROM frames WHERE id = $1",
    [id]
  );

  if (!frame) notFound();

  frame.image_url = resolveUrl(frame.image_url);
  frame.blur_data = resolveUrl(frame.blur_data);
  frame.audio_url = resolveUrl(frame.audio_url);
  frame.supplement_images = (frame.supplement_images || []).map(resolveUrl);

  const credits: Record<string, string | { name: string; url?: string }> = frame.credits || {};

  let related: RelatedFrame[] = [];
  try {
    related = await query<RelatedFrame>(
      "SELECT id, title, image_url, blur_data FROM frames WHERE id != $1 ORDER BY created_at DESC LIMIT 4",
      [id]
    );
    related = related.map((r) => ({
      ...r,
      image_url: resolveUrl(r.image_url),
      blur_data: resolveUrl(r.blur_data),
    }));
  } catch {}

  return (
    <main className="min-h-screen">
      <ScanTracker frameId={frame.id} />

      <ImageGallery
        mainImage={frame.image_url}
        mainBlur={frame.blur_data || undefined}
        supplementImages={frame.supplement_images || []}
        title={frame.title}
        accentColor={frame.accent_color}
      />

      <section className="max-w-[var(--max-text-width)] mx-auto px-6 py-12 md:py-16">
        {/* Audio player */}
        {frame.audio_url && (
          <div className="mb-8 p-4 rounded-xl bg-white/5 border border-white/10 flex items-center gap-4 animate-slide-up-delay-1">
            <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <AudioPlayer src={frame.audio_url} />
            </div>
          </div>
        )}

        <div className="animate-slide-up-delay-2">
          <div
            className="font-[family-name:var(--font-montserrat)] text-white/80 leading-relaxed text-base md:text-lg space-y-6
              [&_h2]:font-[family-name:var(--font-handorty)] [&_h2]:text-2xl [&_h2]:text-gold [&_h2]:mt-10 [&_h2]:mb-4
              [&_h3]:font-[family-name:var(--font-handorty)] [&_h3]:text-xl [&_h3]:text-gold [&_h3]:mt-8 [&_h3]:mb-3
              [&_a]:text-gold [&_a]:underline [&_a]:underline-offset-2 [&_a]:hover:text-gold-dark
              [&_strong]:text-white [&_strong]:font-semibold
              [&_em]:italic
              [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2
              [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:space-y-2
              [&_li]:text-white/70
              [&_blockquote]:border-l-2 [&_blockquote]:border-gold/40 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-white/60"
            style={{ overflowWrap: "break-word", wordBreak: "normal" }}
            dangerouslySetInnerHTML={{ __html: frame.story }}
          />
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
              {Object.entries(credits).map(([role, credit]) => {
                const name = typeof credit === "string" ? credit : credit.name;
                const url = typeof credit === "string" ? undefined : credit.url;
                return (
                  <span key={role} className="text-white/40 text-sm font-[family-name:var(--font-montserrat)]">
                    {role} by{" "}
                    {url ? (
                      <a href={url} target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-gold transition-colors underline underline-offset-2">
                        {name}
                      </a>
                    ) : (
                      <span className="text-white/60">{name}</span>
                    )}
                  </span>
                );
              })}
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
                  <LazyImage
                    src={r.image_url}
                    alt={r.title}
                    blur={r.blur_data || undefined}
                    className="w-full h-full"
                    loading="lazy"
                  />
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
