import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Breadcrumbs, Callout, ConfidenceBadge, ItemChip, Section, SourcesFooter, ThreatBadge } from "@/components/ui";
import { maps } from "@/content/world";
import { pdfKeysByMap } from "@/content/pdf";
import { botsOnMap, getMap, questsOnMap } from "@/lib/data";
import { getData } from "@/lib/live-data";
import { pageMeta } from "@/lib/site";
import { Difficulty } from "@/components/Difficulty";

export function generateStaticParams() {
  return maps.map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const m = getMap((await params).slug);
  if (!m) return {};
  return pageMeta({ title: `${m.name} map guide`, description: `${m.name}: ${m.summary} Points of interest, keys, ARC and quests.`, path: `/maps/${m.slug}`, image: m.image?.[0]?.src });
}

export default async function MapPage({ params }: { params: Promise<{ slug: string }> }) {
  const { keysForMap } = await getData();
  const m = getMap((await params).slug);
  if (!m) notFound();
  const pdf = pdfKeysByMap.find((k) => k.map === m.slug);
  const keys = keysForMap(m.slug);
  const arc = botsOnMap(m.slug);
  const quests = questsOnMap(m.slug);

  return (
    <article>
      <Breadcrumbs trail={[{ href: "/maps", label: "Maps & Locations" }, { label: m.name }]} />
      <header className="mb-8">
        <p className="eyebrow mb-1">Map{m.added ? ` · added ${m.added}` : ""}</p>
        <h1 className="font-display text-5xl font-bold uppercase leading-none tracking-wide md:text-6xl">{m.name}</h1>
        <p className="mt-3 max-w-3xl text-ink-2">{m.summary}</p>
        <dl className="mt-4 flex flex-wrap gap-x-8 gap-y-2 text-sm">
          <div><dt className="eyebrow">Difficulty</dt><dd><Difficulty value={m.difficulty} /></dd></div>
          <div><dt className="eyebrow">Unlock</dt><dd className="text-ink">{m.unlock ?? "—"}</dd></div>
          <div><dt className="eyebrow">ARC types</dt><dd className="num text-ink">{arc.length}</dd></div>
          <div><dt className="eyebrow">Quests</dt><dd className="num text-ink">{quests.length}</dd></div>
        </dl>
      </header>

      {m.image?.length ? (
        <div className={m.image.length > 1 ? "mb-10 grid gap-4 md:grid-cols-2" : "mb-10"}>
          {m.image.map((img) => (
            <figure key={img.src} className="panel overflow-hidden">
              <a href={img.src} target="_blank" rel="noopener noreferrer" className="relative block aspect-square bg-bg md:aspect-[4/3]">
                <Image src={img.src} alt={img.alt} fill sizes="(min-width:1024px) 60rem, 100vw" className="object-contain" />
              </a>
              <figcaption className="border-t border-line px-3 py-2 text-xs text-muted">{img.alt}. Map render from the RaidTheory dataset — select to open full size.</figcaption>
            </figure>
          ))}
        </div>
      ) : (
        <Callout tone="info" title="No map image yet">This map is newer than the dataset snapshot used here, so there is no overview image or POI data.</Callout>
      )}

      <div className="grid gap-x-8 lg:grid-cols-2">
        <Section id="conditions" title="Map conditions & extraction">
          {m.conditions?.length ? (
            <ul className="space-y-2">
              {m.conditions.map((c) => (
                <li key={c.name} className="panel p-3 text-sm">
                  <span className="font-medium text-ink">{c.name}</span> <span className="rounded border border-line-2 px-1 font-mono text-[0.6rem] uppercase text-muted">{c.kind}</span>
                  {c.note && <p className="mt-1 text-ink-2">{c.note}</p>}
                </li>
              ))}
            </ul>
          ) : <p className="text-sm text-muted">No map-specific conditions recorded. General conditions (e.g. Night Raid, Electromagnetic Storm, Hurricane) rotate across maps.</p>}
          {m.extraction && (
            <p className="mt-4 text-sm text-ink-2"><span className="eyebrow mr-2">Extraction</span>{m.extraction.text} <ConfidenceBadge level={m.extraction.confidence} /> <Link href="/guides/extraction-and-death" className="link">How extraction works</Link></p>
          )}
        </Section>

        <Section id="pois" title="Points of interest">
          {pdf?.pois.length ? (
            <>
              <ul className="flex flex-wrap gap-1.5">{pdf.pois.map((p) => <li key={p} className="rounded border border-line bg-bg-2 px-2 py-1 text-sm text-ink-2">{p}</li>)}</ul>
              <p className="mt-2 text-xs text-muted">Location names read from the cheat sheet’s keycard map. Not an exhaustive list.</p>
            </>
          ) : <p className="text-sm text-muted">No verified POI list for this map yet.</p>}
        </Section>
      </div>

      <Section id="keys" title="Keys & locked rooms">
        {keys.length ? (
          <ul className="grid gap-3 md:grid-cols-2">
            {keys.map((k) => (
              <li key={k.id} className="panel flex items-start gap-3 p-3">
                <ItemChip id={k.id} />
                <p className="pt-1.5 text-sm text-ink-2">{k.description}</p>
              </li>
            ))}
          </ul>
        ) : <p className="text-sm text-muted">No keys recorded for this map.</p>}
        {pdf?.extra && <p className="mt-3 text-sm text-ink-2">{pdf.extra}</p>}
      </Section>

      <div className="grid gap-x-8 lg:grid-cols-2">
        <Section id="arc" title="ARC on this map">
          {arc.length ? (
            <ul className="space-y-1.5">{arc.map((b) => <li key={b.id} className="flex items-center justify-between gap-2 text-sm"><Link className="link" href={`/enemies/${b.slug}`}>{b.name}</Link><ThreatBadge threat={b.threat} /></li>)}</ul>
          ) : <p className="text-sm text-muted">No ARC spawn data.</p>}
        </Section>
        <Section id="quests" title="Quests on this map">
          {quests.length ? (
            <ul className="columns-1 gap-4 text-sm sm:columns-2">{quests.map((q) => <li key={q.id} className="mb-1 break-inside-avoid"><Link className="link" href={`/quests/${q.slug}`}>{q.name}</Link></li>)}</ul>
          ) : <p className="text-sm text-muted">No quests recorded for this map.</p>}
        </Section>
      </div>

      <Section id="advice" title="Survival advice">
        <div className="mb-2"><ConfidenceBadge level="strategy" /></div>
        <ul className="list-disc space-y-1 pl-5 text-ink-2">
          <li>Check which extraction points are open as soon as you land, and plan a route that passes your quest locations.</li>
          {(m.difficulty ?? 0) >= 4 && <li>This is one of the harder maps: bring a shield, extra healing and gear you can afford to lose.</li>}
          {arc.some((b) => b.threat === "Critical" || b.threat === "Extreme") && <li>Critical-threat ARC spawn here — avoid them solo unless you came for their parts.</li>}
          {keys.length > 0 && <li>Bring the matching key in your safe pocket to loot locked rooms.</li>}
        </ul>
      </Section>

      <SourcesFooter ids={m.sources} />
    </article>
  );
}
