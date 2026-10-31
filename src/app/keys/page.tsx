import Link from "next/link";
import { Breadcrumbs, Callout, ItemChip, PageHeader, RarityBadge, Section, SourcesFooter } from "@/components/ui";
import { maps } from "@/content/world";
import { rarityRank } from "@/lib/data";
import { getData } from "@/lib/live-data";
import { pageMeta } from "@/lib/site";

export const metadata = pageMeta({
  title: "Keycards — where to use every key",
  description: "Every ARC Raiders key and keycard grouped by map, with the room it opens and its rarity.",
  path: "/keys",
});

export default async function KeysPage() {
  const { items, keysForMap } = await getData();
  const allKeys = items.filter((i) => i.type === "Key");
  const placed = new Set<string>();
  const groups = maps.map((m) => {
    const keys = keysForMap(m.slug).sort((a, b) => rarityRank(b.rarity) - rarityRank(a.rarity));
    keys.forEach((k) => placed.add(k.id));
    return { map: m, keys };
  });
  const other = allKeys.filter((k) => !placed.has(k.id));

  return (
    <>
      <Breadcrumbs trail={[{ href: "/maps", label: "Maps & Locations" }, { label: "Keycards" }]} />
      <PageHeader eyebrow="Maps & Locations" title="Keycards">
        <p>{allKeys.length} keys, security codes and keycards, grouped by the map they belong to. Rooms come from each key’s in-game description.</p>
      </PageHeader>
      <Callout tone="tip">Keep keys in your safe pocket — keys in your backpack are lost if you die. The v3.4 cheat sheet links each key to a short video guide by u/toofumed.</Callout>
      {groups.filter((g) => g.keys.length).map(({ map, keys }) => (
        <Section key={map.slug} id={map.slug} title={map.name} action={<Link href={`/maps/${map.slug}#keys`} className="link text-sm">Map guide →</Link>}>
          <div className="panel overflow-x-auto">
            <table className="table-arc">
              <thead><tr><th scope="col">Key</th><th scope="col">Rarity</th><th scope="col">Opens</th></tr></thead>
              <tbody>
                {keys.map((k) => (
                  <tr key={k.id}>
                    <td className="min-w-56"><ItemChip id={k.id} /></td>
                    <td><RarityBadge rarity={k.rarity} /></td>
                    <td>{k.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      ))}
      {other.length > 0 && (
        <Section id="other" title="Other keys">
          <ul className="flex flex-wrap gap-2">{other.map((k) => <li key={k.id}><ItemChip id={k.id} /></li>)}</ul>
        </Section>
      )}
      <SourcesFooter ids={["dataset", "pdf"]} />
    </>
  );
}
