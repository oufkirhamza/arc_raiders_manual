import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Breadcrumbs, Callout, ChipList, ConfidenceBadge, Section, SourcesFooter, Stat, ThreatBadge } from "@/components/ui";
import { bots, getBotBySlug, getMap, mapSlugFor, quests } from "@/lib/data";
import { getData } from "@/lib/live-data";
import { pageMeta } from "@/lib/site";

export function generateStaticParams() {
  return bots.map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const b = getBotBySlug((await params).slug);
  if (!b) return {};
  return pageMeta({
    title: `${b.name} — ARC ${b.type}`,
    description: `${b.name} (${b.threat} threat ${b.type.toLowerCase()}): ${b.description ?? ""} Weakness, drops and where it spawns.`.slice(0, 300),
    path: `/enemies/${b.slug}`,
    image: b.image,
  });
}

const TACTICS: Record<string, string[]> = {
  Low: ["Safe to engage solo with basic weapons.", "Clear it quickly to keep the area quiet."],
  Moderate: ["Manageable solo — keep moving and use cover.", "Watch for it alerting or joining other ARC."],
  High: ["Engage from cover and commit only when you can finish the fight.", "Bring spare ammo and healing; disengage if Raiders join."],
  Critical: ["Treat as a squad fight; solo players should avoid unless a quest requires it.", "Target the listed weak point and use explosives where possible.", "The fight will be loud — expect company."],
  Extreme: ["Boss encounter. Coordinate as a full squad with heavy weapons and plenty of healing.", "Plan an exit before engaging."],
};

export default async function EnemyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { usesOf } = await getData();
  const b = getBotBySlug((await params).slug);
  if (!b) notFound();
  const mapList = [...new Set((b.maps ?? []).map(mapSlugFor).filter(Boolean) as string[])].map((s) => getMap(s)!);
  const nameRe = new RegExp(`\\b${b.name}s?\\b`, "i");
  const relatedQuests = quests.filter((q) => q.objectives.some((o) => nameRe.test(o)));
  const dropUses = (b.drops ?? []).filter((d) => usesOf(d).some((u) => u.kind === "workshop" || u.kind === "quest" || u.kind === "project"));

  return (
    <article>
      <Breadcrumbs trail={[{ href: "/enemies", label: "ARC Enemies" }, { label: b.name }]} />
      <header className="panel panel-cut mb-8 grid gap-6 overflow-hidden md:grid-cols-[1fr_1.2fr]">
        <div className="relative aspect-[4/3] bg-gradient-to-b from-panel-2 to-bg md:aspect-auto md:min-h-72">
          {b.image && <Image src={b.image} alt={`${b.name}, ARC ${b.type.toLowerCase()}`} fill priority sizes="(min-width:768px) 40vw, 100vw" className="object-contain p-4" />}
        </div>
        <div className="p-5">
          <p className="eyebrow mb-1">ARC · {b.type}</p>
          <h1 className="font-display text-5xl font-bold uppercase leading-none tracking-wide">{b.name}</h1>
          <div className="mt-3 flex flex-wrap gap-2"><ThreatBadge threat={b.threat} /><ConfidenceBadge level="dataset" /></div>
          <p className="mt-4 text-ink-2">{b.description}</p>
          <dl className="mt-5 grid grid-cols-2 gap-2">
            <Stat label="Destroy XP" value={b.destroyXp ?? "—"} />
            <Stat label="Loot XP" value={b.lootXp ?? "—"} />
          </dl>
        </div>
      </header>

      {b.weakness && (
        <Callout tone="tip" title="Weakness">{b.weakness}</Callout>
      )}

      <div className="grid gap-x-8 lg:grid-cols-2">
        <Section id="drops" title="Drops">
          <ChipList list={(b.drops ?? []).map((id) => ({ id }))} empty="No drop data." />
          {dropUses.length > 0 && <p className="mt-3 text-sm text-muted">{dropUses.length} of these drops are needed for workshop upgrades, quests or projects — open them to see where.</p>}
        </Section>
        <Section id="tactics" title="Tactics">
          <div className="mb-2"><ConfidenceBadge level="strategy" /></div>
          <ul className="list-disc space-y-1 pl-5 text-ink-2">{TACTICS[b.threat]?.map((t) => <li key={t}>{t}</li>)}</ul>
        </Section>
      </div>

      <div className="grid gap-x-8 lg:grid-cols-2">
        <Section id="maps" title="Where it appears">
          {mapList.length ? (
            <ul className="flex flex-wrap gap-2">{mapList.map((m) => <li key={m.slug}><Link href={`/maps/${m.slug}`} className="rounded border border-line bg-bg-2 px-3 py-1.5 text-sm hover:border-accent/60">{m.name}</Link></li>)}</ul>
          ) : <p className="text-sm text-muted">No map data.</p>}
        </Section>
        <Section id="quests" title="Related quests">
          {relatedQuests.length ? (
            <ul className="space-y-1 text-sm">{relatedQuests.map((q) => <li key={q.id}><Link className="link" href={`/quests/${q.slug}`}>{q.name}</Link> <span className="text-muted">({q.trader})</span></li>)}</ul>
          ) : <p className="text-sm text-muted">No quest objectives mention {b.name}.</p>}
        </Section>
      </div>

      <SourcesFooter ids={["dataset"]} />
    </article>
  );
}
