/**
 * Data validation: referential integrity of the imported dataset plus the PDF cross-check.
 * Run with `npm run validate`. Exits non-zero on broken references in curated content.
 */
import { baseData, bots, isCurrency, projects, quests, trades, workshop } from "../src/lib/data";
import { crosscheck, crosscheckSummary } from "../src/lib/crosscheck";
import { guides } from "../src/content/guides";
import { maps, traders } from "../src/content/world";
import { sources } from "../src/content/sources";

const { getItem, items, weaponFamilies } = baseData;

const datasetIssues: string[] = [];
const curatedIssues: string[] = [];
const check = (bucket: string[], id: string | undefined, where: string) => {
  if (id && !getItem(id) && !isCurrency(id)) bucket.push(`${where}: unknown item "${id}"`);
};

for (const i of items) {
  for (const k of ["recipe", "recyclesInto", "salvagesInto", "upgradeCost", "repairCost"] as const)
    i[k]?.forEach((r) => check(datasetIssues, r.id, `item ${i.id}.${k}`));
  check(datasetIssues, i.upgradesTo, `item ${i.id}.upgradesTo`);
}
for (const q of quests)
  for (const k of ["requiredItems", "grantedItems", "rewards"] as const) q[k]?.forEach((r) => check(datasetIssues, r.id, `quest ${q.id}.${k}`));
for (const w of workshop) for (const l of w.levels) l.requirements.forEach((r) => check(datasetIssues, r.id, `station ${w.id} L${l.level}`));
for (const p of projects) for (const ph of p.phases) ph.items?.forEach((r) => check(datasetIssues, r.id, `project ${p.id} P${ph.phase}`));
for (const b of bots) b.drops?.forEach((d) => check(datasetIssues, d, `bot ${b.id}.drops`));
for (const t of trades) { check(datasetIssues, t.itemId, `trade ${t.trader}`); check(datasetIssues, t.cost?.id, `trade ${t.trader} cost`); }

const sourceIds = new Set(Object.keys(sources));
for (const g of guides) {
  g.sources.forEach((s) => sourceIds.has(s) || curatedIssues.push(`guide ${g.slug}: unknown source ${s}`));
  g.related?.forEach((r) => guides.some((x) => x.slug === r) || curatedIssues.push(`guide ${g.slug}: unknown related ${r}`));
  for (const s of g.sections) for (const b of s.blocks) if (b.type === "items") b.ids.forEach((id) => check(curatedIssues, id, `guide ${g.slug}`));
}
for (const m of maps) m.sources.forEach((s) => sourceIds.has(s) || curatedIssues.push(`map ${m.slug}: unknown source ${s}`));
for (const t of traders) t.sources.forEach((s) => sourceIds.has(s) || curatedIssues.push(`trader ${t.slug}: unknown source ${s}`));

const slugs = new Set<string>();
for (const i of items) { if (slugs.has(i.slug)) curatedIssues.push(`duplicate item slug ${i.slug}`); slugs.add(i.slug); }

console.log(`Items ${items.length} · quests ${quests.length} · ARC ${bots.length} · weapon families ${weaponFamilies.length}`);
console.log(`Dataset reference issues: ${datasetIssues.length}`);
datasetIssues.slice(0, 30).forEach((x) => console.log("  -", x));
console.log(`Curated content issues: ${curatedIssues.length}`);
curatedIssues.forEach((x) => console.log("  -", x));
console.log(`PDF cross-check: ${crosscheckSummary.match} match · ${crosscheckSummary.conflict} conflict · ${crosscheckSummary.missing} missing (of ${crosscheckSummary.total})`);
for (const c of crosscheck.filter((c) => c.status !== "match"))
  console.log(`  ! [${c.area}] ${c.subject} — ${c.field}: PDF ${c.pdf} vs dataset ${c.dataset}`);

if (curatedIssues.length) process.exit(1);
