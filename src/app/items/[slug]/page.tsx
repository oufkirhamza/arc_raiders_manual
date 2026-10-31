import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Star } from "lucide-react";
import {
  Breadcrumbs, Callout, ChipList, Coins, ConfidenceBadge, EmptyState, ItemChip, ItemImage, RarityBadge, Section, SourcesFooter, Stat, cx,
} from "@/components/ui";
import { CopyButton } from "@/components/CopyButton";
import { CURRENCIES, TRADER_SLUGS, droppedBy, questRewardsOf, stationName, tradesFor } from "@/lib/data";
import { getData } from "@/lib/live-data";
import { conflictsFor } from "@/lib/crosscheck";
import { pdfDonors, pdfKeepForQuests } from "@/content/pdf";
import { pageMeta } from "@/lib/site";
import type { Item } from "@/lib/types";
import type { ItemData } from "@/lib/data";

export async function generateStaticParams() {
  const { items } = await getData();
  return items.map((i) => ({ slug: i.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { getItemBySlug } = await getData();
  const item = getItemBySlug((await params).slug);
  if (!item) return {};
  const bits = [item.rarity, item.type, `sells for ${item.value.toLocaleString("en-US")} coins`];
  return pageMeta({
    title: item.name,
    description: `${item.name} (${bits.join(", ")}). ${item.description ?? ""} Crafting, recycling, sources and uses in ARC Raiders.`.slice(0, 300),
    path: `/items/${item.slug}`,
    image: item.image,
  });
}

const fmtCost = (getItem: ItemData["getItem"], cost?: Record<string, number>) =>
  Object.entries(cost ?? {}).map(([k, v]) => `${v.toLocaleString("en-US")} ${CURRENCIES[k] ?? getItem(k)?.name ?? k}`).join(" + ");

function recipeText(getItem: ItemData["getItem"], item: Item) {
  const lines = item.recipe?.map((r) => `${r.qty}x ${getItem(r.id)?.name ?? r.id}`) ?? [];
  const bench = item.craftBench?.filter((b) => b !== "in_raid").map(stationName).join(" / ");
  return `${item.name}${item.craftQuantity ? ` (x${item.craftQuantity})` : ""}: ${lines.join(", ")}${bench ? ` — ${bench}${item.stationLevel ? ` L${item.stationLevel}` : ""}` : ""}`;
}

export default async function ItemPage({ params }: { params: Promise<{ slug: string }> }) {
  const { familyOfItem, getItem, getItemBySlug, items, recycleRoi, sourcesOf, sumValue, usesOf } = await getData();
  const item = getItemBySlug((await params).slug);
  if (!item) notFound();

  const roi = recycleRoi(item);
  const uses = usesOf(item.id);
  const recipeUses = uses.filter((u) => u.kind === "recipe");
  const upgradeUses = uses.filter((u) => u.kind === "upgrade");
  const workshopUses = uses.filter((u) => u.kind === "workshop");
  const questUses = uses.filter((u) => u.kind === "quest");
  const projectUses = uses.filter((u) => u.kind === "project");
  const donors = sourcesOf(item.id);
  const pdfDonorInfo = pdfDonors.find((d) => d.componentId === item.id);
  const bestDonors = new Set(pdfDonorInfo?.donors.filter((d) => d.best).map((d) => d.id));
  const rewards = questRewardsOf(item.id);
  const drops = droppedBy(item.id);
  const trades = tradesFor(item.id);
  const family = familyOfItem(item.id);
  const keep = pdfKeepForQuests.find((k) => k.id === item.id);
  const conflicts = conflictsFor(`/items/${item.slug}`);
  const isMod = item.type === "Modification";
  const related = items
    .filter((i) => i.type === item.type && i.id !== item.id)
    .sort((a, b) => Math.abs(a.value - item.value) - Math.abs(b.value - item.value))
    .slice(0, 6);
  const neededTotal = workshopUses.length + questUses.length + projectUses.length;

  return (
    <article>
      <Breadcrumbs trail={[{ href: "/items", label: "Items & Components" }, { href: `/items?type=${encodeURIComponent(item.type)}`, label: item.type }, { label: item.name }]} />

      {/* ---------- header ---------- */}
      <header className="panel panel-cut mb-8 flex flex-col gap-6 p-5 md:flex-row md:items-start">
        <ItemImage src={item.image} alt={item.name} size={144} rarity={item.rarity} priority className="mx-auto md:mx-0" />
        <div className="min-w-0 flex-1">
          <p className="eyebrow mb-1">{item.type}</p>
          <h1 className="font-display text-4xl font-bold uppercase leading-none tracking-wide md:text-5xl">{item.name}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <RarityBadge rarity={item.rarity} />
            {item.blueprintLocked && <span className="rounded border border-line-2 px-1.5 py-0.5 font-mono text-[0.65rem] uppercase text-ink-2">Blueprint required</span>}
            {neededTotal > 0 && <span className="rounded border border-accent/50 px-1.5 py-0.5 font-mono text-[0.65rem] uppercase text-accent">Keep · needed in {neededTotal} {neededTotal === 1 ? "place" : "places"}</span>}
            {item.questItem && <span className="rounded border border-info/50 px-1.5 py-0.5 font-mono text-[0.65rem] uppercase text-info">Quest item</span>}
            <ConfidenceBadge level={item.edited ? "editor" : conflicts.length ? "conflict" : "dataset"} />
            {item.edited && <span className="text-xs text-muted">{item.edited.isNew ? "Added" : "Corrected"} by the editor on {item.edited.at.slice(0, 10)}</span>}
          </div>
          {item.description && <p className="mt-4 max-w-2xl text-ink-2">{item.description}</p>}
          {item.tip && <p className="mt-2 max-w-2xl text-sm text-muted">Tip: {item.tip}</p>}
          <dl className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Stat label="Sell value" value={<Coins value={item.value} />} />
            <Stat label="Weight" value={item.weightKg != null ? `${item.weightKg} kg` : "—"} />
            <Stat label="Stack size" value={item.stackSize ?? "—"} />
            <Stat
              label="Recycle ROI"
              value={roi ? <span className={roi.roi >= 0 ? "text-ok" : "text-bad"}>{roi.roi > 0 ? "▲ +" : roi.roi < 0 ? "▼ " : ""}{roi.roi}%</span> : "—"}
              hint={roi ? `Recycles into ${roi.recycle} coins of materials` : "Not recyclable"}
            />
          </dl>
        </div>
      </header>

      {conflicts.length > 0 && (
        <Callout tone="warning" title="Sources disagree">
          <ul className="list-disc pl-5">
            {conflicts.map((c, i) => (
              <li key={i}>{c.field}: cheat sheet says <strong>{c.pdf}</strong>, dataset says <strong>{c.dataset}</strong>.</li>
            ))}
          </ul>
          <p className="mt-1">Values shown on this page come from the dataset. <Link className="link" href="/sources#conflicts">All conflicts</Link></p>
        </Callout>
      )}
      {keep && (
        <Callout tone="tip" title="Keep for quests">
          The v3.4 cheat sheet recommends keeping <strong>{keep.qty}×</strong> {item.name} for quests.
        </Callout>
      )}

      <div className="grid gap-x-8 lg:grid-cols-2">
        {/* ---------- crafting ---------- */}
        <Section id="crafting" title="Crafting" action={item.recipe?.length ? <CopyButton text={recipeText(getItem, item)} label="Copy recipe" /> : undefined}>
          {item.recipe?.length ? (
            <div className="panel p-4">
              <p className="mb-3 text-sm text-ink-2">
                Crafted at{" "}
                <strong className="text-ink">
                  {item.craftBench?.map((b) => stationName(b) + (b !== "in_raid" && b !== "workbench" && item.stationLevel ? ` (level ${item.stationLevel})` : "")).join(" or ")}
                </strong>
                {item.craftQuantity ? <> · makes <span className="num">{item.craftQuantity}</span></> : null}
                {item.blueprintLocked ? " · requires the blueprint" : null}
              </p>
              <ChipList list={item.recipe} />
              <p className="mt-3 text-xs text-muted">Material value: <Coins value={sumValue(item.recipe)} /></p>
            </div>
          ) : (
            <p className="text-sm text-muted">This item cannot be crafted (per the dataset).</p>
          )}
          {item.upgradeCost?.length ? (
            <div className="panel mt-3 p-4">
              <p className="mb-3 text-sm text-ink-2">
                Upgrade cost{item.upgradesTo && getItem(item.upgradesTo) ? <> → <Link className="link" href={`/items/${getItem(item.upgradesTo)!.slug}`}>{getItem(item.upgradesTo)!.name}</Link></> : null}
              </p>
              <ChipList list={item.upgradeCost} />
            </div>
          ) : null}
          {item.repairCost?.length ? (
            <div className="panel mt-3 p-4">
              <p className="mb-3 text-sm text-ink-2">Repair cost</p>
              <ChipList list={item.repairCost} />
            </div>
          ) : null}
        </Section>

        {/* ---------- recycling ---------- */}
        <Section id="recycling" title="Recycling & salvage">
          <div className="space-y-3">
            <div className="panel p-4">
              <p className="mb-3 text-sm text-ink-2">Recycles into{roi ? <> — worth <Coins value={roi.recycle} /></> : null}</p>
              <ChipList list={item.recyclesInto} empty="Not recyclable." />
            </div>
            <div className="panel p-4">
              <p className="mb-3 text-sm text-ink-2">Salvages into</p>
              <ChipList list={item.salvagesInto} empty="Cannot be salvaged." />
            </div>
            {roi && (
              <p className="text-xs text-muted">
                ROI = (recycle value − sell value) ÷ sell value. {roi.roi >= 0 ? "Recycling returns at least as much value as selling." : "Selling returns more coin value; recycle only when you need the materials."}{" "}
                <Link className="link" href="/recycling">Compare all items</Link>
              </p>
            )}
          </div>
        </Section>
      </div>

      {/* ---------- where to get it ---------- */}
      <Section id="sources" title="How to get it">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="panel p-4">
            <h3 className="eyebrow mb-3">Recycled from {pdfDonorInfo && <span className="normal-case tracking-normal text-muted">· <Star className="inline h-3 w-3 fill-accent text-accent" aria-label="star" /> = cheat sheet’s best donor</span>}</h3>
            {donors.length ? (
              <ul className="flex flex-wrap gap-2">
                {donors.slice(0, 24).map((d, i) => (
                  <li key={i} className="relative">
                    <ItemChip id={d.item.id} qty={d.qty} note={d.via === "salvage" ? "salvage" : undefined} />
                    {bestDonors.has(d.item.id) && <Star className="absolute -right-1 -top-1 h-3.5 w-3.5 fill-accent text-accent" aria-label="Best donor" />}
                  </li>
                ))}
              </ul>
            ) : <p className="text-sm text-muted">No items recycle into this.</p>}
            {donors.length > 24 && <p className="mt-2 text-xs text-muted">+{donors.length - 24} more sources.</p>}
          </div>
          <div className="space-y-4">
            {item.foundIn?.length ? (
              <div className="panel p-4">
                <h3 className="eyebrow mb-2">Found in (loot areas)</h3>
                <p className="text-sm text-ink-2">{item.foundIn.join(", ")}</p>
              </div>
            ) : null}
            {drops.length ? (
              <div className="panel p-4">
                <h3 className="eyebrow mb-2">Dropped by ARC</h3>
                <ul className="flex flex-wrap gap-2 text-sm">
                  {drops.map((b) => <li key={b.id}><Link className="link" href={`/enemies/${b.slug}`}>{b.name}</Link></li>)}
                </ul>
              </div>
            ) : null}
            {item.vendors?.length || trades.length ? (
              <div className="panel p-4">
                <h3 className="eyebrow mb-2">Sold by traders</h3>
                <ul className="space-y-1.5 text-sm text-ink-2">
                  {item.vendors?.map((v, i) => (
                    <li key={`v${i}`}>
                      <Link className="link" href={`/traders/${TRADER_SLUGS[v.trader] ?? ""}`}>{v.trader}</Link> — {fmtCost(getItem, v.cost)}
                      {v.limit ? ` · limit ${v.limit}${v.refreshSeconds ? ` per ${Math.round(v.refreshSeconds / 3600)}h` : ""}` : ""}
                      {v.requiredLevel ? ` · trader level ${v.requiredLevel}` : ""}
                    </li>
                  ))}
                  {trades.map((t, i) => (
                    <li key={`t${i}`}>
                      <Link className="link" href={`/traders/${TRADER_SLUGS[t.trader] ?? ""}`}>{t.trader}</Link> (barter) — {t.qty}× for {t.cost ? `${t.cost.qty}× ${getItem(t.cost.id)?.name ?? CURRENCIES[t.cost.id] ?? t.cost.id}` : "—"}
                      {t.dailyLimit ? ` · ${t.dailyLimit}/day` : ""}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {rewards.length ? (
              <div className="panel p-4">
                <h3 className="eyebrow mb-2">Quest reward</h3>
                <ul className="space-y-1 text-sm">
                  {rewards.map((r) => <li key={r.quest.id}><Link className="link" href={`/quests/${r.quest.slug}`}>{r.quest.name}</Link> <span className="num text-muted">×{r.qty}</span></li>)}
                </ul>
              </div>
            ) : null}
          </div>
        </div>
      </Section>

      {/* ---------- what it's for ---------- */}
      <Section id="uses" title="What it's used for">
        {uses.length === 0 && !family && !item.compatibleWith?.length ? (
          <EmptyState title="No known uses">The dataset lists no recipes, upgrades, quests or projects that need this item. It is usually safe to sell or recycle.</EmptyState>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {workshopUses.length > 0 && (
              <div className="panel p-4">
                <h3 className="eyebrow mb-2">Workshop upgrades</h3>
                <ul className="space-y-1 text-sm">
                  {workshopUses.map((u, i) => u.kind === "workshop" && (
                    <li key={i}><Link className="link" href={`/workshop#${u.station.id}`}>{u.station.name} level {u.level}</Link> <span className="num text-accent">×{u.qty}</span></li>
                  ))}
                </ul>
              </div>
            )}
            {questUses.length > 0 && (
              <div className="panel p-4">
                <h3 className="eyebrow mb-2">Quests (hand-in)</h3>
                <ul className="space-y-1 text-sm">
                  {questUses.map((u, i) => u.kind === "quest" && (
                    <li key={i}><Link className="link" href={`/quests/${u.quest.slug}`}>{u.quest.name}</Link> <span className="text-muted">({u.quest.trader})</span> <span className="num text-accent">×{u.qty}</span></li>
                  ))}
                </ul>
              </div>
            )}
            {projectUses.length > 0 && (
              <div className="panel p-4">
                <h3 className="eyebrow mb-2">Projects & Expeditions</h3>
                <ul className="space-y-1 text-sm">
                  {projectUses.map((u, i) => u.kind === "project" && (
                    <li key={i}><Link className="link" href={`/projects/${u.project.slug}`}>{u.project.name}</Link> <span className="text-muted">· phase {u.phase} {u.phaseName}</span> <span className="num text-accent">×{u.qty}</span></li>
                  ))}
                </ul>
              </div>
            )}
            {recipeUses.length > 0 && (
              <div className={cx("panel p-4", recipeUses.length > 8 && "md:col-span-2")}>
                <h3 className="eyebrow mb-3">Crafting ingredient in {recipeUses.length} recipe{recipeUses.length > 1 ? "s" : ""}</h3>
                <ul className="flex flex-wrap gap-2">
                  {recipeUses.map((u, i) => u.kind === "recipe" && <li key={i}><ItemChip id={u.item.id} note={`needs ${u.qty}`} /></li>)}
                </ul>
              </div>
            )}
            {upgradeUses.length > 0 && (
              <div className="panel p-4">
                <h3 className="eyebrow mb-3">Weapon/gear upgrades</h3>
                <ul className="flex flex-wrap gap-2">
                  {upgradeUses.map((u, i) => u.kind === "upgrade" && <li key={i}><ItemChip id={u.item.id} note={`needs ${u.qty}`} /></li>)}
                </ul>
              </div>
            )}
            {family && (
              <div className="panel p-4">
                <h3 className="eyebrow mb-2">Weapon family</h3>
                <p className="text-sm"><Link className="link" href={`/weapons/${family.slug}`}>{family.name}</Link> — all tiers, upgrade path and magazine sizes.</p>
              </div>
            )}
            {item.compatibleWith?.length ? (
              <div className="panel p-4">
                <h3 className="eyebrow mb-2">{isMod ? "Fits" : "Used by"}</h3>
                <p className="text-sm text-ink-2">{item.compatibleWith.join(", ")}</p>
                {isMod && <p className="mt-2 text-xs text-muted"><Link className="link" href="/attachments">Tested attachment effects</Link></p>}
              </div>
            ) : null}
          </div>
        )}
      </Section>

      {related.length > 0 && (
        <Section id="related" title={`Related ${item.type.toLowerCase()} items`}>
          <ul className="flex flex-wrap gap-2">{related.map((r) => <li key={r.id}><ItemChip id={r.id} /></li>)}</ul>
        </Section>
      )}

      <aside className="panel mt-10 flex flex-col gap-3 p-4 text-sm sm:flex-row sm:items-center sm:justify-between">
        <p className="text-ink-2">Something wrong or missing on this page?</p>
        <Link href={`/contribute?type=correction&item=${item.slug}`} className="shrink-0 rounded border border-accent/60 px-3 py-1.5 text-accent hover:bg-accent/10">Suggest a correction</Link>
      </aside>

      <SourcesFooter ids={pdfDonorInfo || keep || conflicts.length ? ["dataset", "pdf"] : ["dataset"]} updated={item.edited?.at.slice(0, 10) ?? item.updatedAt} />
    </article>
  );
}
