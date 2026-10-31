import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { ConfidenceBadge, ItemChip, Section, ThreatBadge } from "@/components/ui";
import { GuideCard } from "@/components/GuideCard";
import { NavIcon } from "@/components/icons";
import { bots, quests, datasetMeta } from "@/lib/data";
import { getData } from "@/lib/live-data";
import { guides } from "@/content/guides";
import { maps, updates } from "@/content/world";
import { crosscheckSummary } from "@/lib/crosscheck";


const POPULAR = ["durable_cloth", "advanced_electrical_components", "raider_hatch_key", "wasp_driver", "leaper_pulse_unit", "arc_alloy", "mechanical_components", "exodus_modules"];

export default async function Home() {
  const { items, weaponFamilies } = await getData();
  const QUICK = [
    { href: "/getting-started", icon: "compass", label: "Getting Started", note: "Core loop & first raid" },
    { href: "/items", icon: "package", label: "Items", note: `${items.length} entries` },
    { href: "/weapons", icon: "crosshair", label: "Weapons", note: `${weaponFamilies.length} families` },
    { href: "/enemies", icon: "bot", label: "ARC Enemies", note: `${bots.length} machines` },
    { href: "/maps", icon: "map", label: "Maps", note: `${maps.length} regions` },
    { href: "/quests", icon: "scroll", label: "Quests", note: `${quests.length} quests` },
    { href: "/workshop", icon: "hammer", label: "Workshop", note: "Upgrade costs" },
    { href: "/recycling", icon: "recycle", label: "Recycle or Sell", note: "ROI for every item" },
  ];
  const latest = updates[0];
  const recent = [...guides].sort((a, b) => b.updated.localeCompare(a.updated)).slice(0, 3);
  const featured = ["beginners-guide", "recycling-vs-selling", "attachments-explained"];
  const dangerous = bots.filter((b) => b.threat === "Extreme" || b.threat === "Critical").slice(0, 4);

  return (
    <>
      {/* ---------- hero ---------- */}
      <section className="relative -mx-4 -mt-8 mb-12 overflow-hidden border-b border-line lg:-mx-8">
        <Image src="/img/maps/dam-battlegrounds.webp" alt="" fill priority sizes="100vw" className="object-cover opacity-25" />
        <div className="absolute inset-0 bg-gradient-to-r from-bg via-bg/85 to-bg/40" />
        <div className="relative px-4 py-14 md:py-20 lg:px-8">
          <p className="eyebrow mb-3 text-accent">Unofficial ARC Raiders knowledge base</p>
          <h1 className="max-w-3xl font-display text-5xl font-bold uppercase leading-[0.95] tracking-wide md:text-7xl">
            Know what to loot.<br />Know what to keep.
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-ink-2">
            Searchable items, crafting and recycling, weapons and attachments, ARC weaknesses, maps, keycards, quests and workshop upgrades —
            built from the v3.4 Master Cheat Sheet and a structured game dataset, with every fact labelled by how sure we are.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/getting-started" className="inline-flex items-center gap-2 rounded bg-accent px-5 py-2.5 font-medium text-accent-ink hover:brightness-110">
              New Raider? Start here <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link href="/search" className="rounded border border-line-2 bg-bg/60 px-5 py-2.5 text-ink hover:border-accent/60">Search the manual</Link>
          </div>
          <dl className="mt-10 grid max-w-2xl grid-cols-3 gap-4 border-t border-line pt-5">
            <div><dt className="eyebrow">Items</dt><dd className="num text-2xl text-ink">{items.length}</dd></div>
            <div><dt className="eyebrow">Quests</dt><dd className="num text-2xl text-ink">{quests.length}</dd></div>
            <div><dt className="eyebrow">Values cross-checked</dt><dd className="num text-2xl text-ink">{crosscheckSummary.total}</dd></div>
          </dl>
        </div>
      </section>

      {/* ---------- update banner ---------- */}
      <aside className="panel mb-12 flex flex-col gap-3 border-l-4 border-l-accent p-5 md:flex-row md:items-center md:justify-between" aria-label="Latest update">
        <div>
          <p className="eyebrow mb-1">Latest update · <time dateTime={latest.date}>{latest.date}</time></p>
          <p className="font-display text-2xl font-bold uppercase tracking-wide">{latest.title}{latest.version ? ` (${latest.version})` : ""}</p>
          <p className="mt-1 max-w-3xl text-sm text-ink-2">{latest.points[0]} {latest.points[1]}</p>
        </div>
        <Link href="/guides/frozen-trail-whats-new" className="shrink-0 rounded border border-line-2 px-4 py-2 text-sm hover:border-accent/60">What&apos;s new & what we cover →</Link>
      </aside>

      {/* ---------- quick access ---------- */}
      <Section id="quick" title="Quick access">
        <ul className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {QUICK.map((q) => (
            <li key={q.href}>
              <Link href={q.href} className="panel group flex h-full flex-col gap-3 p-4 transition-colors hover:border-accent/50">
                <NavIcon name={q.icon} className="h-6 w-6 text-accent" />
                <span>
                  <span className="block font-display text-lg uppercase tracking-wide group-hover:text-accent">{q.label}</span>
                  <span className="block text-xs text-muted">{q.note}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="featured" title="Featured guides" action={<Link href="/guides" className="link text-sm">All guides →</Link>}>
        <ul className="grid gap-3 md:grid-cols-3">{featured.map((s) => <li key={s}><GuideCard slug={s} /></li>)}</ul>
      </Section>

      <div className="grid gap-x-8 lg:grid-cols-2">
        <Section id="popular" title="High-demand components" action={<Link href="/recycling#donors" className="link text-sm">Best donors →</Link>}>
          <p className="mb-3 text-sm text-muted">Items that gate workshop upgrades, quests and Expedition projects.</p>
          <ul className="flex flex-wrap gap-2">{POPULAR.map((id) => <li key={id}><ItemChip id={id} /></li>)}</ul>
        </Section>
        <Section id="threats" title="Biggest threats" action={<Link href="/enemies" className="link text-sm">All ARC →</Link>}>
          <ul className="grid gap-2 sm:grid-cols-2">
            {dangerous.map((b) => (
              <li key={b.id}>
                <Link href={`/enemies/${b.slug}`} className="panel group flex items-center gap-3 p-2.5 hover:border-accent/50">
                  <div className="relative h-12 w-14 shrink-0">{b.image && <Image src={b.image} alt="" fill sizes="3.5rem" className="object-contain" />}</div>
                  <span className="min-w-0">
                    <span className="block font-display text-lg uppercase tracking-wide group-hover:text-accent">{b.name}</span>
                    <ThreatBadge threat={b.threat} />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      </div>

      <Section id="maps" title="Maps" action={<Link href="/maps" className="link text-sm">All maps →</Link>}>
        <ul className="flex gap-3 overflow-x-auto pb-2">
          {maps.map((m) => (
            <li key={m.slug} className="w-56 shrink-0">
              <Link href={`/maps/${m.slug}`} className="panel group block overflow-hidden hover:border-accent/50">
                <div className="relative aspect-[4/3] bg-bg">
                  {m.image?.[0] ? <Image src={m.image[0].src} alt="" fill sizes="14rem" className="object-cover opacity-70 group-hover:opacity-100" /> : <div className="hazard-stripe absolute inset-0 opacity-10" />}
                </div>
                <p className="px-3 py-2 font-display uppercase tracking-wide group-hover:text-accent">{m.name}</p>
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="recent" title="Recently updated">
        <ul className="grid gap-3 md:grid-cols-3">{recent.map((g) => <li key={g.slug}><GuideCard slug={g.slug} /></li>)}</ul>
      </Section>

      <aside className="panel flex flex-col gap-2 p-5 text-sm text-ink-2 md:flex-row md:items-center md:justify-between">
        <p>
          Data snapshot {datasetMeta.committedAt?.slice(0, 10)} · {crosscheckSummary.match} of {crosscheckSummary.total} cheat-sheet values confirmed, {crosscheckSummary.conflict} flagged.{" "}
          <ConfidenceBadge level="verified" /> <ConfidenceBadge level="conflict" />
        </p>
        <Link href="/sources" className="link shrink-0">How we verify →</Link>
      </aside>
    </>
  );
}
