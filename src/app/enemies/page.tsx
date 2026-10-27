import Link from "next/link";
import Image from "next/image";
import { Breadcrumbs, Callout, ConfidenceBadge, PageHeader, Section, SourcesFooter, ThreatBadge } from "@/components/ui";
import { bots, mapSlugFor, getMap, THREATS } from "@/lib/data";
import { undocumentedArc } from "@/content/world";
import { pageMeta } from "@/lib/site";

export const metadata = pageMeta({
  title: "ARC enemies — threat levels, weaknesses and drops",
  description: "Every ARC machine in ARC Raiders with threat level, weak points, XP and the parts they drop.",
  path: "/enemies",
});

export default function EnemiesPage() {
  return (
    <>
      <Breadcrumbs trail={[{ label: "ARC Enemies" }]} />
      <PageHeader eyebrow="Database" title="ARC Enemies">
        <p>{bots.length} ARC machines with data, sorted from most to least dangerous. Threat levels run {THREATS.join(" → ")}.</p>
      </PageHeader>

      {[...THREATS].reverse().map((t) => {
        const list = bots.filter((b) => b.threat === t);
        if (!list.length) return null;
        return (
          <Section key={t} id={t.toLowerCase()} title={`${t} threat`}>
            <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {list.map((b) => {
                const mapNames = [...new Set((b.maps ?? []).map(mapSlugFor).filter(Boolean))].map((s) => getMap(s!)!.name);
                return (
                  <li key={b.id}>
                    <Link href={`/enemies/${b.slug}`} className="panel group flex h-full flex-col overflow-hidden transition-colors hover:border-accent/50">
                      <div className="relative aspect-[16/9] bg-gradient-to-b from-panel-2 to-bg">
                        {b.image && <Image src={b.image} alt="" fill sizes="(min-width:1280px) 22rem, (min-width:640px) 45vw, 90vw" className="object-contain p-3 transition-transform group-hover:scale-105" />}
                      </div>
                      <div className="flex flex-1 flex-col gap-2 border-t border-line p-4">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="font-display text-2xl font-bold uppercase tracking-wide group-hover:text-accent">{b.name}</h3>
                          <ThreatBadge threat={b.threat} />
                        </div>
                        <p className="text-sm text-muted">{b.type}</p>
                        <p className="line-clamp-2 text-sm text-ink-2">{b.description}</p>
                        {mapNames.length > 0 && <p className="mt-auto pt-1 text-xs text-muted">{mapNames.length >= 6 ? "All maps" : mapNames.join(" · ")}</p>}
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </Section>
        );
      })}

      <Section id="new" title="Newer ARC (not in the dataset yet)">
        <Callout tone="info" title="Limited information">These machines were added in later updates. Only what launch coverage reported is listed — no stats or weaknesses are invented.</Callout>
        <ul className="grid gap-3 md:grid-cols-2">
          {undocumentedArc.map((a) => (
            <li key={a.name} className="panel p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-xl font-bold uppercase tracking-wide">{a.name}</h3>
                <ConfidenceBadge level="community" />
              </div>
              <p className="mt-1 text-sm text-ink-2">{a.note}</p>
              <p className="mt-1 text-xs text-muted">Added {a.added}</p>
            </li>
          ))}
        </ul>
      </Section>

      <SourcesFooter ids={["dataset", "rivenTides", "frozenTrailShack"]} />
    </>
  );
}
