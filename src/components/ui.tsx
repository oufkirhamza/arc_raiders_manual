/** Server-side UI building blocks (may read game data). Client components import from ./primitives. */
import Link from "next/link";
import { ChevronRight, Info, Lightbulb, TriangleAlert, ExternalLink } from "lucide-react";
import type { Confidence, SourceRef } from "@/lib/types";
import { CURRENCIES, getItem } from "@/lib/data";
import { sources as SOURCES, type SourceId } from "@/content/sources";
import { cx, ItemImage } from "./primitives";

export { cx, rarityStyle, RarityBadge, ItemImage, Coins } from "./primitives";

// ---------- threat / confidence ----------
const THREAT_STYLE: Record<string, string> = {
  Low: "text-r-uncommon border-r-uncommon/40",
  Moderate: "text-info border-info/40",
  High: "text-accent border-accent/40",
  Critical: "text-hazard border-hazard/50",
  Extreme: "text-bad border-bad/60 bg-bad/10",
};
export function ThreatBadge({ threat }: { threat: string }) {
  return (
    <span className={cx("inline-flex items-center gap-1 rounded border px-1.5 py-0.5 font-mono text-[0.68rem] uppercase tracking-wider", THREAT_STYLE[threat])}>
      <span aria-hidden="true">▲</span> Threat: {threat}
    </span>
  );
}

const CONFIDENCE: Record<Confidence, { label: string; cls: string; help: string }> = {
  verified: { label: "Verified", cls: "text-ok border-ok/40", help: "Confirmed by an official source or by two independent sources that agree." },
  dataset: { label: "Dataset", cls: "text-info border-info/40", help: "From the community-datamined dataset (RaidTheory)." },
  pdf: { label: "Cheat sheet", cls: "text-accent border-accent/40", help: "From the v3.4 community cheat sheet (in-game testing)." },
  community: { label: "Community", cls: "text-ink-2 border-line-2", help: "Reported by community guides or press; not independently verified here." },
  conflict: { label: "Conflict", cls: "text-bad border-bad/50", help: "Sources disagree. Both values are shown." },
  strategy: { label: "Strategy", cls: "text-r-epic border-r-epic/40", help: "Our recommendation, not a game fact." },
};
export function ConfidenceBadge({ level }: { level: Confidence }) {
  const c = CONFIDENCE[level];
  return (
    <span title={c.help} className={cx("inline-flex items-center rounded border px-1.5 py-0.5 font-mono text-[0.65rem] uppercase tracking-wider", c.cls)}>
      {c.label}
      <span className="sr-only">: {c.help}</span>
    </span>
  );
}
export const confidenceHelp = CONFIDENCE;

// ---------- layout ----------
export function Breadcrumbs({ trail }: { trail: { href?: string; label: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex flex-wrap items-center gap-1 text-sm text-muted">
        <li><Link href="/" className="hover:text-ink">Home</Link></li>
        {trail.map((t, i) => (
          <li key={i} className="flex items-center gap-1">
            <ChevronRight className="h-3.5 w-3.5 opacity-60" aria-hidden="true" />
            {t.href && i < trail.length - 1 ? (
              <Link href={t.href} className="hover:text-ink">{t.label}</Link>
            ) : (
              <span aria-current={i === trail.length - 1 ? "page" : undefined} className="text-ink-2">{t.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function PageHeader({ eyebrow, title, children, aside }: { eyebrow?: string; title: string; children?: React.ReactNode; aside?: React.ReactNode }) {
  return (
    <header className="mb-8 flex flex-col gap-4 border-b border-line pb-6 md:flex-row md:items-end md:justify-between">
      <div className="max-w-3xl">
        {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
        <h1 className="font-display text-4xl font-bold uppercase leading-none tracking-wide text-ink md:text-5xl">{title}</h1>
        {children && <div className="mt-3 text-ink-2">{children}</div>}
      </div>
      {aside}
    </header>
  );
}

export function Section({ id, title, children, action, className }: { id?: string; title: string; children: React.ReactNode; action?: React.ReactNode; className?: string }) {
  return (
    <section id={id} aria-labelledby={id ? `${id}-h` : undefined} className={cx("mb-10", className)}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 id={id ? `${id}-h` : undefined} className="flex items-center gap-2 font-display text-2xl font-semibold uppercase tracking-wide">
          <span className="h-4 w-1 bg-accent" aria-hidden="true" />
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export function Callout({ tone = "info", title, children }: { tone?: "tip" | "warning" | "info"; title?: string; children: React.ReactNode }) {
  const Icon = tone === "warning" ? TriangleAlert : tone === "tip" ? Lightbulb : Info;
  const cls = tone === "warning" ? "border-hazard/50 bg-hazard/5" : tone === "tip" ? "border-ok/40 bg-ok/5" : "border-info/40 bg-info/5";
  const ic = tone === "warning" ? "text-hazard" : tone === "tip" ? "text-ok" : "text-info";
  return (
    <aside role="note" className={cx("my-4 flex gap-3 rounded-md border-l-4 border p-4", cls)}>
      <Icon className={cx("mt-0.5 h-5 w-5 shrink-0", ic)} aria-hidden="true" />
      <div className="text-sm text-ink-2">
        <p className="mb-1 font-semibold text-ink">{title ?? (tone === "warning" ? "Warning" : tone === "tip" ? "Tip" : "Note")}</p>
        <div className="leading-relaxed">{children}</div>
      </div>
    </aside>
  );
}

export function EmptyState({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="panel flex flex-col items-center gap-2 px-6 py-12 text-center">
      <p className="font-display text-xl uppercase tracking-wide">{title}</p>
      {children && <div className="max-w-md text-sm text-muted">{children}</div>}
    </div>
  );
}

export function Stat({ label, value, hint }: { label: string; value: React.ReactNode; hint?: string }) {
  return (
    <div className="rounded-md border border-line bg-bg-2 px-3 py-2.5">
      <dt className="eyebrow">{label}</dt>
      <dd className="num mt-1 text-lg text-ink" title={hint}>{value}</dd>
    </div>
  );
}

// ---------- item references ----------
export function ItemChip({ id, qty, note, href }: { id: string; qty?: number; note?: string; href?: string }) {
  const item = getItem(id);
  if (!item) {
    return (
      <span className="inline-flex items-center gap-2 rounded border border-line bg-bg-2 px-2 py-1.5 text-sm text-ink-2">
        {qty != null && <span className="num text-accent">×{qty.toLocaleString("en-US")}</span>}
        {CURRENCIES[id] ?? id.replace(/_/g, " ")}
      </span>
    );
  }
  return (
    <Link
      href={href ?? `/items/${item.slug}`}
      className="group inline-flex items-center gap-2 rounded border border-line bg-bg-2 py-1 pl-1 pr-2.5 text-sm transition-colors hover:border-accent/60 hover:bg-panel-2"
    >
      <ItemImage src={item.image} alt="" size={32} rarity={item.rarity} />
      {qty != null && <span className="num text-accent">×{qty.toLocaleString("en-US")}</span>}
      <span className="text-ink group-hover:text-accent">{item.name}</span>
      {note && <span className="text-xs text-muted">{note}</span>}
    </Link>
  );
}

export function ChipList({ list, empty = "None" }: { list?: { id: string; qty?: number; note?: string }[]; empty?: string }) {
  if (!list?.length) return <p className="text-sm text-muted">{empty}</p>;
  return (
    <ul className="flex flex-wrap gap-2">
      {list.map((r, i) => (
        <li key={`${r.id}-${i}`}><ItemChip id={r.id} qty={r.qty} note={r.note} /></li>
      ))}
    </ul>
  );
}

// ---------- sources ----------
export function SourceList({ ids, extra }: { ids: SourceId[]; extra?: SourceRef[] }) {
  const list: SourceRef[] = [...ids.map((id) => SOURCES[id] as SourceRef), ...(extra ?? [])];
  if (!list.length) return null;
  return (
    <ul className="space-y-2 text-sm">
      {list.map((s) => (
        <li key={s.id} className="flex flex-wrap items-baseline gap-x-2 text-ink-2">
          {s.url ? (
            <a href={s.url} target="_blank" rel="noopener noreferrer" className="link inline-flex items-center gap-1">
              {s.title}
              <ExternalLink className="h-3 w-3" aria-hidden="true" />
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          ) : (
            <span>{s.title}</span>
          )}
          <span className="text-muted">— {s.publisher}{s.date ? `, ${s.date}` : ""}</span>
        </li>
      ))}
    </ul>
  );
}

export function SourcesFooter({ ids, updated }: { ids: SourceId[]; updated?: string }) {
  return (
    <footer className="mt-12 border-t border-line pt-6">
      <h2 className="eyebrow mb-3">Sources{updated ? ` · last updated ${updated}` : ""}</h2>
      <SourceList ids={ids} />
    </footer>
  );
}
