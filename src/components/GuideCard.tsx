import Link from "next/link";
import { guides } from "@/content/guides";

export function GuideCard({ slug }: { slug: string }) {
  const g = guides.find((x) => x.slug === slug);
  if (!g) return null;
  return (
    <Link href={`/guides/${g.slug}`} className="panel group flex h-full flex-col gap-2 p-4 transition-colors hover:border-accent/50">
      <span className="eyebrow">{g.category}</span>
      <h3 className="font-display text-xl font-bold uppercase leading-tight tracking-wide group-hover:text-accent">{g.title}</h3>
      <p className="text-sm text-ink-2">{g.summary}</p>
      <span className="mt-auto pt-1 text-xs text-muted">{g.sections.length} sections · updated {g.updated}</span>
    </Link>
  );
}
