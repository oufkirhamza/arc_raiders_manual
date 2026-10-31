import { bots, projects, quests, workshop, type ItemData } from "./data";
import { guides } from "@/content/guides";
import { maps, traders } from "@/content/world";

export type DocType = "Item" | "Weapon" | "ARC" | "Quest" | "Guide" | "Map" | "Trader" | "Project" | "Station" | "Page";
export interface SearchDoc {
  type: DocType;
  title: string;
  desc: string;
  href: string;
  /** extra searchable text, not shown */
  k?: string;
  img?: string;
}

const clip = (s = "", n = 140) => (s.length > n ? s.slice(0, n - 1).trimEnd() + "…" : s);

export function buildSearchIndex({ items, weaponFamilies }: ItemData): SearchDoc[] {
  const docs: SearchDoc[] = [];
  for (const i of items)
    docs.push({ type: "Item", title: i.name, desc: clip(`${i.rarity} ${i.type}. ${i.description ?? ""}`), href: `/items/${i.slug}`, k: i.type, img: i.image });
  for (const f of weaponFamilies)
    docs.push({ type: "Weapon", title: f.name, desc: clip(`${f.type}${f.ammo ? ` · ${f.ammo}` : ""}. ${f.tiers[0].description ?? ""}`), href: `/weapons/${f.slug}`, k: f.type, img: f.tiers[0].image });
  for (const b of bots)
    docs.push({ type: "ARC", title: b.name, desc: clip(`${b.threat} threat ${b.type}. ${b.description ?? ""}`), href: `/enemies/${b.slug}`, k: b.type, img: b.image });
  for (const q of quests)
    docs.push({ type: "Quest", title: q.name, desc: clip(`${q.trader}: ${q.objectives.join("; ")}`), href: `/quests/${q.slug}`, k: q.trader });
  for (const g of guides)
    docs.push({ type: "Guide", title: g.title, desc: clip(g.summary), href: `/guides/${g.slug}`, k: g.sections.map((s) => s.heading).join(" ") });
  for (const m of maps)
    docs.push({ type: "Map", title: m.name, desc: clip(m.summary), href: `/maps/${m.slug}` });
  for (const t of traders)
    docs.push({ type: "Trader", title: t.name, desc: clip(`${t.role}. ${t.summary}`), href: `/traders/${t.slug}`, k: t.sells.join(" "), img: t.image });
  for (const p of projects)
    docs.push({ type: "Project", title: p.name, desc: clip(p.description), href: `/projects/${p.slug}` });
  for (const w of workshop)
    docs.push({ type: "Station", title: w.name, desc: `Workshop station · ${w.maxLevel} levels`, href: `/workshop#${w.id}` });
  const pages: [string, string, string][] = [
    ["Recycle or Sell?", "Recycling value index for every recyclable item and the best donors per component.", "/recycling"],
    ["Attachments", "Tested effects of grips, compensators, silencers, barrels, stocks and magazines.", "/attachments"],
    ["Keycards", "Every key and keycard by map.", "/keys"],
    ["Skill tree", "Conditioning, Mobility and Survival skill nodes.", "/skills"],
    ["Getting Started", "Core loop, essential mechanics and first upgrades.", "/getting-started"],
    ["Updates", "Patch and expansion timeline, including Frozen Trail.", "/updates"],
    ["Sources & Data", "Where the data comes from and known conflicts.", "/sources"],
  ];
  for (const [title, desc, href] of pages) docs.push({ type: "Page", title, desc, href });
  return docs;
}
