import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  Breadcrumbs, Callout, ChipList, Coins, ConfidenceBadge, ItemChip, ItemImage, RarityBadge, Section, SourcesFooter, Stat,
} from "@/components/ui";
import { getItem, getWeaponFamily, stationName, weaponFamilies, TRADER_SLUGS, CURRENCIES } from "@/lib/data";
import { pdfAttachments } from "@/content/pdf";
import { pageMeta } from "@/lib/site";

export function generateStaticParams() {
  return weaponFamilies.map((f) => ({ slug: f.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const f = getWeaponFamily((await params).slug);
  if (!f) return {};
  return pageMeta({
    title: `${f.name} (${f.type})`,
    description: `${f.name} in ARC Raiders: ${f.type}${f.ammo ? `, ${f.ammo}` : ""}. Crafting recipe, tier upgrades, attachments slots and magazine sizes.`,
    path: `/weapons/${f.slug}`,
    image: f.tiers[0].image,
  });
}

const STAT_LABELS: Record<string, string> = { damage: "Damage", fireRate: "Fire rate", range: "Range", stability: "Stability", agility: "Agility", stealth: "Stealth" };
const SLOT_LABELS: Record<string, string> = { muzzle: "Muzzle", grip: "Underbarrel / grip", magazine: "Magazine", stock: "Stock", special: "Special", tech: "Tech" };

export default async function WeaponPage({ params }: { params: Promise<{ slug: string }> }) {
  const f = getWeaponFamily((await params).slug);
  if (!f) notFound();
  const t1 = f.tiers[0];
  const statTier = f.tiers.find((t) => t.stats?.damage != null);
  const slots = Object.entries(t1.modSlots ?? {});
  const vendors = f.tiers.flatMap((t) => (t.vendors ?? []).map((v) => ({ ...v, tier: t })));
  const testedFor = pdfAttachments.filter((a) => a.mostEffective?.includes(f.id));

  return (
    <article>
      <Breadcrumbs trail={[{ href: "/weapons", label: "Weapons" }, { href: `/weapons#${f.type.toLowerCase().replace(/\s+/g, "-")}`, label: f.type }, { label: f.name }]} />
      <header className="panel panel-cut mb-8 flex flex-col gap-6 p-5 md:flex-row">
        <ItemImage src={t1.image} alt={f.name} size={160} rarity={t1.rarity} priority className="mx-auto md:mx-0" />
        <div className="flex-1">
          <p className="eyebrow mb-1">{f.type}</p>
          <h1 className="font-display text-5xl font-bold uppercase leading-none tracking-wide">{f.name}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <RarityBadge rarity={t1.rarity} />
            {t1.blueprintLocked && <span className="rounded border border-line-2 px-1.5 py-0.5 font-mono text-[0.65rem] uppercase text-ink-2">Blueprint required</span>}
            <ConfidenceBadge level="dataset" />
          </div>
          {t1.description && <p className="mt-4 max-w-2xl text-ink-2">{t1.description}</p>}
          <dl className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Stat label="Ammo" value={f.ammo ?? "—"} />
            <Stat label="Magazine" value={f.magazine ? `${f.magazine[0]}` : "—"} hint="Without an extended magazine (cheat sheet)" />
            <Stat label="Weight" value={t1.weightKg != null ? `${t1.weightKg} kg` : "—"} />
            <Stat label="Tiers" value={f.tiers.length} />
          </dl>
        </div>
      </header>

      <Section id="tiers" title="Tiers & upgrade path">
        <div className="panel overflow-x-auto">
          <table className="table-arc">
            <thead><tr><th scope="col">Tier</th><th scope="col">Rarity</th><th scope="col">How to get</th><th scope="col">Upgrade to next tier</th><th scope="col" className="text-right">Sell value</th></tr></thead>
            <tbody>
              {f.tiers.map((t) => (
                <tr key={t.id}>
                  <td><Link href={`/items/${t.slug}`} className="link">{t.name}</Link></td>
                  <td><RarityBadge rarity={t.rarity} /></td>
                  <td>
                    {t.recipe?.length ? (
                      <div>
                        <p className="mb-2 text-xs text-muted">Craft at {t.craftBench?.map(stationName).join(" / ")}{t.stationLevel ? ` (L${t.stationLevel})` : ""}</p>
                        <ChipList list={t.recipe} />
                      </div>
                    ) : <span className="text-sm text-muted">Upgrade from previous tier</span>}
                  </td>
                  <td>{t.upgradeCost?.length ? <ChipList list={t.upgradeCost} /> : <span className="text-sm text-muted">—</span>}</td>
                  <td className="text-right"><Coins value={t.value} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <div className="grid gap-x-8 lg:grid-cols-2">
        <Section id="stats" title="Stats">
          {statTier?.stats ? (
            <>
              <dl className="grid grid-cols-3 gap-2">
                {Object.entries(statTier.stats).map(([k, v]) => <Stat key={k} label={STAT_LABELS[k] ?? k} value={v} />)}
              </dl>
              <p className="mt-2 text-xs text-muted">From the dataset entry for {statTier.name}. Other tiers have no stat values in the dataset.</p>
            </>
          ) : (
            <p className="text-sm text-muted">The dataset has no verified damage/fire-rate numbers for this weapon yet, so none are shown.</p>
          )}
          {f.magazine && (
            <div className="panel mt-4 p-4">
              <h3 className="eyebrow mb-2">Magazine size ({f.magazineAmmo} mag)</h3>
              <table className="table-arc">
                <thead><tr><th scope="col">No ext. mag</th><th scope="col">Ext. I</th><th scope="col">Ext. II</th><th scope="col">Ext. III</th></tr></thead>
                <tbody><tr>{f.magazine.map((m, i) => <td key={i} className="num text-ink">{m}</td>)}</tr></tbody>
              </table>
              <p className="mt-2 text-xs text-muted">Cheat sheet v3.4 (in-game testing).</p>
            </div>
          )}
        </Section>

        <Section id="attachments" title="Attachment slots">
          {slots.length ? (
            <div className="space-y-3">
              {slots.map(([slot, ids]) => (
                <div key={slot} className="panel p-4">
                  <h3 className="eyebrow mb-2">{SLOT_LABELS[slot] ?? slot}</h3>
                  <ul className="flex flex-wrap gap-2">{ids.filter((id) => getItem(id)).map((id) => <li key={id}><ItemChip id={id} /></li>)}</ul>
                </div>
              ))}
            </div>
          ) : <p className="text-sm text-muted">No attachment slots listed.</p>}
          {testedFor.length > 0 && (
            <Callout tone="tip" title="Tested recommendation">
              The cheat sheet lists {f.name} among the weapons that benefit most from: {testedFor.map((a) => a.stat.toLowerCase()).join(", ")} improvements.{" "}
              <Link className="link" href="/attachments">See values</Link>
            </Callout>
          )}
        </Section>
      </div>

      {vendors.length > 0 && (
        <Section id="vendors" title="Sold by">
          <ul className="space-y-1.5 text-sm text-ink-2">
            {vendors.map((v, i) => (
              <li key={i}>
                <Link className="link" href={`/traders/${TRADER_SLUGS[v.trader] ?? ""}`}>{v.trader}</Link> sells {v.tier.name} for{" "}
                {Object.entries(v.cost ?? {}).map(([k, n]) => `${n.toLocaleString("en-US")} ${CURRENCIES[k] ?? k}`).join(" + ")}
                {v.requiredLevel ? ` (trader level ${v.requiredLevel})` : ""}
                {v.limit ? ` · limit ${v.limit}/day` : ""}
              </li>
            ))}
          </ul>
        </Section>
      )}

      <SourcesFooter ids={f.magazine ? ["dataset", "pdf"] : ["dataset"]} updated={t1.updatedAt} />
    </article>
  );
}
