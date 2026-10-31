import itemsJson from "@/data/generated/items.json";
import questsJson from "@/data/generated/quests.json";
import workshopJson from "@/data/generated/workshop.json";
import projectsJson from "@/data/generated/projects.json";
import botsJson from "@/data/generated/bots.json";
import tradesJson from "@/data/generated/trades.json";
import skillsJson from "@/data/generated/skills.json";
import mapEventsJson from "@/data/generated/map-events.json";
import metaJson from "@/data/generated/meta.json";
import { maps } from "@/content/world";
import { pdfKeepForQuests, pdfKeysByMap, pdfMagazines } from "@/content/pdf";
import type { Bot, Item, Project, Qty, Quest, SkillNode, Trade, WorkshopStation } from "./types";

export const RARITIES = ["Common", "Uncommon", "Rare", "Epic", "Legendary"] as const;
export const THREATS = ["Low", "Moderate", "High", "Critical", "Extreme"] as const;

/** The imported dataset, before editor changes. Pages should use `getData()` from live-data.ts. */
export const baseItems = itemsJson as Item[];
export const quests = questsJson as Quest[];
export const workshop = workshopJson as WorkshopStation[];
export const projects = projectsJson as Project[];
export const bots = (botsJson as Bot[]).slice().sort((a, b) => threatRank(b.threat) - threatRank(a.threat) || a.name.localeCompare(b.name));
export const trades = tradesJson as Trade[];
export const skills = skillsJson as SkillNode[];
export const mapEvents = mapEventsJson as { id: string; name: string; category: string }[];
export const datasetMeta = metaJson;
export function threatRank(t: string) {
  return THREATS.indexOf(t as (typeof THREATS)[number]);
}
export function rarityRank(r: string) {
  return RARITIES.indexOf(r as (typeof RARITIES)[number]);
}

// ---------- static lookups (not affected by item edits) ----------
const questById = new Map(quests.map((q) => [q.id, q]));
export const getQuest = (id: string) => questById.get(id);
export const getQuestBySlug = (slug: string) => quests.find((q) => q.slug === slug);
export const getBotBySlug = (slug: string) => bots.find((b) => b.slug === slug);
export const getStation = (id: string) => workshop.find((w) => w.id === id);
export const getProjectBySlug = (slug: string) => projects.find((p) => p.slug === slug);

export const STATION_NAMES: Record<string, string> = Object.fromEntries([
  ...workshop.map((w) => [w.id, w.name]),
  ["workbench", "Workbench"],
  ["in_raid", "In-raid crafting"],
]);
export const stationName = (id: string) => STATION_NAMES[id] ?? id.replace(/_/g, " ");

/** Normalises dataset map ids (per-floor ids, "stella_montis") to our map slugs. */
export function mapSlugFor(datasetId: string) {
  return maps.find((m) => m.datasetIds.includes(datasetId))?.slug;
}
export const getMap = (slug: string) => maps.find((m) => m.slug === slug);

const push = <T,>(m: Map<string, T[]>, k: string, v: T) => {
  const a = m.get(k);
  if (a) a.push(v);
  else m.set(k, [v]);
};

const rewardIndex = new Map<string, { quest: Quest; qty: number }[]>();
for (const q of quests) q.rewards?.forEach((r) => push(rewardIndex, r.id, { quest: q, qty: r.qty }));
const dropIndex = new Map<string, Bot[]>();
for (const b of bots) b.drops?.forEach((d) => push(dropIndex, d, b));

export const questRewardsOf = (id: string) => rewardIndex.get(id) ?? [];
export const droppedBy = (id: string) => dropIndex.get(id) ?? [];
export const tradesFor = (id: string) => trades.filter((t) => t.itemId === id);
export const tradesBy = (trader: string) => trades.filter((t) => t.trader === trader);
export const questsOf = (trader: string) => quests.filter((q) => q.trader === trader);
export const questsOnMap = (slug: string) => quests.filter((q) => q.maps?.some((m) => mapSlugFor(m) === slug));
export const botsOnMap = (slug: string) => bots.filter((b) => b.maps?.some((m) => mapSlugFor(m) === slug));
export const keepForQuests = pdfKeepForQuests;

export type Use = { kind: "recipe"; item: Item; qty: number }
  | { kind: "upgrade"; item: Item; qty: number }
  | { kind: "repair"; item: Item; qty: number }
  | { kind: "workshop"; station: WorkshopStation; level: number; qty: number }
  | { kind: "quest"; quest: Quest; qty: number }
  | { kind: "project"; project: Project; phase: number; phaseName: string; qty: number };

export interface WeaponFamily {
  slug: string;
  id: string;
  name: string;
  type: string;
  ammo?: string;
  tiers: Item[];
  magazine?: [number, number, number, number];
  magazineAmmo?: string;
}
const TIER_RE = /_(i|ii|iii|iv)$/;

/**
 * Everything derived from the item list (lookups, reverse relationships, economy, weapon families).
 * Built once for the base dataset and again whenever editor changes are applied (see live-data.ts).
 */
export function buildItemData(items: Item[]) {
  const itemById = new Map(items.map((i) => [i.id, i]));
  const itemBySlug = new Map(items.map((i) => [i.slug, i]));
  const getItem = (id: string) => itemById.get(id);
  const getItemBySlug = (slug: string) => itemBySlug.get(slug);

  const usesIndex = new Map<string, Use[]>();
  const recycledFromIndex = new Map<string, { item: Item; qty: number; via: "recycle" | "salvage" }[]>();
  for (const it of items) {
    it.recipe?.forEach((r) => push(usesIndex, r.id, { kind: "recipe", item: it, qty: r.qty }));
    it.upgradeCost?.forEach((r) => push(usesIndex, r.id, { kind: "upgrade", item: it, qty: r.qty }));
    it.recyclesInto?.forEach((r) => push(recycledFromIndex, r.id, { item: it, qty: r.qty, via: "recycle" }));
    it.salvagesInto?.forEach((r) => push(recycledFromIndex, r.id, { item: it, qty: r.qty, via: "salvage" }));
  }
  for (const st of workshop)
    for (const lv of st.levels) lv.requirements.forEach((r) => push(usesIndex, r.id, { kind: "workshop", station: st, level: lv.level, qty: r.qty }));
  for (const q of quests) q.requiredItems?.forEach((r) => push(usesIndex, r.id, { kind: "quest", quest: q, qty: r.qty }));
  for (const p of projects.filter((p) => !p.disabled))
    for (const ph of p.phases) ph.items?.forEach((r) => push(usesIndex, r.id, { kind: "project", project: p, phase: ph.phase, phaseName: ph.name, qty: r.qty }));

  const usesOf = (id: string) => usesIndex.get(id) ?? [];
  const sourcesOf = (id: string) =>
    (recycledFromIndex.get(id) ?? []).slice().sort((a, b) => b.qty - a.qty || a.item.name.localeCompare(b.item.name));
  const vendorItemsOf = (trader: string) => items.filter((i) => i.vendors?.some((v) => v.trader === trader));
  const keysForMap = (slug: string) => {
    const map = getMap(slug);
    if (!map) return [];
    const token = map.name.replace(/^The /, "").toLowerCase();
    const short = slug.replace(/^the-/, "").split("-")[0];
    const fromPdf = new Set(pdfKeysByMap.find((k) => k.map === slug)?.keys);
    return items.filter(
      (i) => i.type === "Key" && (fromPdf.has(i.id) || i.description?.toLowerCase().includes(token) || i.id.startsWith(short + "_")),
    );
  };

  const sumValue = (list?: Qty[]) => (list ?? []).reduce((s, r) => s + (getItem(r.id)?.value ?? 0) * r.qty, 0);
  /** Recycling Value Index (cheat-sheet formula). null when not recyclable or no sell value. */
  const recycleRoi = (item: Item) => {
    if (!item.recyclesInto?.length || !item.value) return null;
    const recycle = sumValue(item.recyclesInto);
    return { recycle, roi: Math.round(((recycle - item.value) / item.value) * 100) };
  };
  const isNeeded = (id: string) => usesOf(id).some((u) => u.kind !== "recipe" && u.kind !== "repair");

  const ammoItems = items.filter((i) => i.type === "Ammunition");
  const groups = new Map<string, Item[]>();
  for (const w of items.filter((i) => i.isWeapon)) push(groups, w.id.replace(TIER_RE, ""), w);
  const weaponFamilies: WeaponFamily[] = [...groups.entries()]
    .map(([id, tiers]) => {
      tiers.sort((a, b) => a.id.length - b.id.length || a.id.localeCompare(b.id));
      const name = tiers[0].name.replace(/ I$/, "");
      const ammo = ammoItems.find((a) => a.compatibleWith?.some((c) => c.toLowerCase() === name.toLowerCase()));
      const mag = pdfMagazines.find((m) => m.family === id);
      return { slug: id.replace(/_/g, "-"), id, name, type: tiers[0].type, ammo: ammo?.name, tiers, magazine: mag?.sizes, magazineAmmo: mag?.ammo };
    })
    .sort((a, b) => a.type.localeCompare(b.type) || a.name.localeCompare(b.name));
  const getWeaponFamily = (slug: string) => weaponFamilies.find((f) => f.slug === slug);
  const familyOfItem = (id: string) => weaponFamilies.find((f) => f.tiers.some((t) => t.id === id));
  const ITEM_TYPES = [...new Set(items.map((i) => i.type))].sort();

  return {
    items, getItem, getItemBySlug, usesOf, sourcesOf, vendorItemsOf, keysForMap, sumValue, recycleRoi, isNeeded,
    weaponFamilies, getWeaponFamily, familyOfItem, ITEM_TYPES,
  };
}
export type ItemData = ReturnType<typeof buildItemData>;

/** Derived data for the unedited dataset (used by the cheat-sheet cross-check and scripts). */
export const baseData = buildItemData(baseItems);

// ---------- facets ----------
export const ITEM_GROUPS: Record<string, string[]> = {
  Materials: ["Basic Material", "Topside Material", "Refined Material", "Nature", "Recyclable"],
  Weapons: ["Assault Rifle", "Battle Rifle", "Hand Cannon", "LMG", "Pistol", "SMG", "Shotgun", "Sniper Rifle", "Special"],
  Gear: ["Shield", "Augment", "Modification", "Ammunition", "Quick Use"],
  Other: ["Blueprint", "Key", "Trinket", "Misc"],
};

export const TRADER_SLUGS: Record<string, string> = {
  Celeste: "celeste",
  Shani: "shani",
  "Tian Wen": "tian-wen",
  Lance: "lance",
  Apollo: "apollo",
};

/** Currencies and dataset ids that are not stored as items. */
export const CURRENCIES: Record<string, string> = {
  coins: "Coins",
  creds: "Creds",
  raider_tokens: "Raider Tokens",
  free_loadout_augment: "Free Loadout Augment",
  // A quest reward references the untiered barrel; the dataset only has tiers I–III.
  extended_barrel: "Extended Barrel",
};
export const isCurrency = (id: string) => id in CURRENCIES;

export function formatNumber(n: number) {
  return n.toLocaleString("en-US");
}
