import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="text-center">
        <img src="/logo.png" alt="Frame Dynasty" className="w-24 mx-auto mb-6" />
        <h1 className="font-[family-name:var(--font-handorty)] text-6xl text-gold mb-4">
          404
        </h1>
        <p className="text-white/60 font-[family-name:var(--font-montserrat)] mb-8">
          This frame could not be found.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-orange text-white font-[family-name:var(--font-montserrat)] font-medium hover:bg-orange-dark transition-colors duration-150 active:scale-[0.96]"
        >
          Back to Frame Dynasty
        </Link>
      </div>
    </main>
  );
}
