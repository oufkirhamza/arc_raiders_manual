import Link from "next/link";

export default function NotFound() {
  return (
    <div className="py-16 text-center">
      <p className="eyebrow mb-2">Error 404</p>
      <h1 className="font-display text-5xl font-bold uppercase tracking-wide">Signal lost</h1>
      <p className="mx-auto mt-3 max-w-md text-ink-2">That page doesn&apos;t exist — it may have been renamed after a game update.</p>
      <div className="mt-6 flex justify-center gap-3">
        <Link href="/search" className="rounded bg-accent px-4 py-2 font-medium text-accent-ink hover:brightness-110">Search the manual</Link>
        <Link href="/" className="rounded border border-line px-4 py-2 text-ink hover:border-accent/60">Back to home</Link>
      </div>
    </div>
  );
}
