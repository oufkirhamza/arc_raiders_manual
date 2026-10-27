import Link from "next/link";
import Image from "next/image";
import { Breadcrumbs, PageHeader, SourcesFooter } from "@/components/ui";
import { maps, practiceRange } from "@/content/world";
import { botsOnMap, questsOnMap } from "@/lib/data";
import { pageMeta } from "@/lib/site";
import { Difficulty } from "@/components/Difficulty";

export const metadata = pageMeta({
  title: "Maps & locations",
  description: "All ARC Raiders maps — difficulty, unlock requirements, map conditions, points of interest, keys, ARC and quests per map.",
  path: "/maps",
});

export default function MapsPage() {
  return (
    <>
      <Breadcrumbs trail={[{ label: "Maps & Locations" }]} />
      <PageHeader eyebrow="Topside" title="Maps & Locations">
        <p>{maps.length} raid maps. New maps unlock as you play more rounds. Difficulty and unlock requirements per the community wiki (October 2026).</p>
      </PageHeader>
      <ul className="grid gap-5 md:grid-cols-2">
        {maps.map((m) => (
          <li key={m.slug}>
            <Link href={`/maps/${m.slug}`} className="panel group flex h-full flex-col overflow-hidden transition-colors hover:border-accent/50">
              <div className="relative aspect-[16/9] overflow-hidden bg-bg">
                {m.image?.[0] ? (
                  <Image src={m.image[0].src} alt="" fill sizes="(min-width:768px) 40vw, 100vw" className="object-cover opacity-80 transition duration-300 group-hover:scale-105 group-hover:opacity-100" />
                ) : (
                  <div className="hazard-stripe absolute inset-0 opacity-10" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/30 to-transparent" />
                <h2 className="absolute bottom-3 left-4 font-display text-3xl font-bold uppercase tracking-wide drop-shadow">{m.name}</h2>
                {m.added && <span className="absolute right-3 top-3 rounded bg-accent px-2 py-0.5 font-mono text-[0.65rem] uppercase text-accent-ink">Added {m.added}</span>}
              </div>
              <div className="flex flex-1 flex-col gap-2 p-4">
                <p className="text-sm text-ink-2">{m.summary}</p>
                <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 pt-2 text-xs text-muted">
                  <Difficulty value={m.difficulty} />
                  <span>{m.unlock}</span>
                  <span>{botsOnMap(m.slug).length} ARC types</span>
                  <span>{questsOnMap(m.slug).length} quests</span>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
      <p className="mt-6 text-sm text-muted">Also available: the {practiceRange.name} ({practiceRange.unlock}) — {practiceRange.note}</p>
      <SourcesFooter ids={["wikiMaps", "dataset", "pdf"]} />
    </>
  );
}
