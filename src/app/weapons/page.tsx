import Link from "next/link";
import { Breadcrumbs, Callout, Coins, ItemImage, PageHeader, RarityBadge, Section } from "@/components/ui";
import { stationName } from "@/lib/data";
import { getData } from "@/lib/live-data";
import { pageMeta } from "@/lib/site";

export const metadata = pageMeta({
  title: "Weapons — compare every weapon family",
  description: "Compare all ARC Raiders weapon families: type, ammo, rarity, magazine sizes, crafting bench and upgrade tiers.",
  path: "/weapons",
});

export default async function WeaponsPage() {
  const { weaponFamilies } = await getData();
  const types = [...new Set(weaponFamilies.map((f) => f.type))];
  return (
    <>
      <Breadcrumbs trail={[{ label: "Weapons & Gear" }]} />
      <PageHeader eyebrow="Weapons & Gear" title="Weapons">
        <p>{weaponFamilies.length} weapon families. Most weapons come in four tiers (I–IV) that you upgrade at the Gunsmith; each tier page lists recipes and upgrade materials.</p>
      </PageHeader>

      <Callout tone="info" title="About weapon stats">
        The dataset only carries damage / fire-rate / range numbers for a handful of weapon tiers, so this comparison focuses on verified fields
        (type, ammo, rarity, crafting, magazine size). Magazine sizes come from the v3.4 cheat sheet’s testing.{" "}
        <Link className="link" href="/attachments">How attachments change handling →</Link>
      </Callout>

      {types.map((t) => {
        const fams = weaponFamilies.filter((f) => f.type === t);
        return (
          <Section key={t} id={t.toLowerCase().replace(/\s+/g, "-")} title={t}>
            <div className="panel overflow-x-auto">
              <table className="table-arc">
                <caption className="sr-only">{t} weapon families</caption>
                <thead>
                  <tr><th scope="col">Weapon</th><th scope="col">Base rarity</th><th scope="col">Ammo</th><th scope="col">Magazine</th><th scope="col">Tiers</th><th scope="col">Crafted at</th><th scope="col" className="text-right">Tier I value</th></tr>
                </thead>
                <tbody>
                  {fams.map((f) => {
                    const t1 = f.tiers[0];
                    return (
                      <tr key={f.slug}>
                        <td>
                          <Link href={`/weapons/${f.slug}`} className="group flex items-center gap-3">
                            <ItemImage src={t1.image} alt="" size={44} rarity={t1.rarity} />
                            <span className="font-medium text-ink group-hover:text-accent">{f.name}</span>
                          </Link>
                        </td>
                        <td><RarityBadge rarity={t1.rarity} /></td>
                        <td>{f.ammo ?? <span className="text-muted">—</span>}</td>
                        <td className="num">{f.magazine ? `${f.magazine[0]} → ${f.magazine[3]}` : <span className="text-muted">—</span>}</td>
                        <td className="num">{f.tiers.length}</td>
                        <td className="text-sm">{t1.craftBench?.filter((b) => b !== "workbench").map(stationName).join(", ") || (t1.craftBench?.length ? "Workbench" : <span className="text-muted">Not craftable</span>)}</td>
                        <td className="text-right"><Coins value={t1.value} /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Section>
        );
      })}
    </>
  );
}
