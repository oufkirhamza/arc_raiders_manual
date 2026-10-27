#!/usr/bin/env node
/**
 * Imports the community ARC Raiders dataset (https://github.com/RaidTheory/arcraiders-data, MIT)
 * into compact, English-only JSON files under src/data/generated, and copies the images we use
 * into public/img.
 *
 * Usage: node scripts/import-data.mjs <path-to-arcraiders-data-checkout>
 *
 * The checkout is treated as data only: nothing inside it is executed.
 */
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const SRC = process.argv[2];
if (!SRC || !fs.existsSync(path.join(SRC, "items"))) {
  console.error("Usage: node scripts/import-data.mjs <path-to-arcraiders-data>");
  process.exit(1);
}

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "..");
const OUT = path.join(ROOT, "src", "data", "generated");
const IMG = path.join(ROOT, "public", "img");
fs.mkdirSync(OUT, { recursive: true });

const read = (p) => JSON.parse(fs.readFileSync(path.join(SRC, p), "utf8"));
const en = (v) => (v && typeof v === "object" && !Array.isArray(v) ? (v.en ?? Object.values(v)[0]) : v);
const clean = (s) => (typeof s === "string" ? s.replace(/\r\n/g, "\n").trim() : s);
const slug = (id) => id.replace(/_/g, "-");
const list = (v) => (v == null ? [] : Array.isArray(v) ? v : [v]);
const pairs = (obj) =>
  obj ? Object.entries(obj).map(([id, qty]) => ({ id, qty })) : undefined;
const reqList = (arr) => (arr ? arr.map((r) => ({ id: r.itemId, qty: r.quantity })) : undefined);
const splitList = (s) =>
  typeof s === "string" ? s.split(",").map((x) => x.trim()).filter(Boolean) : list(s);
const prune = (o) => {
  for (const k of Object.keys(o)) {
    const v = o[k];
    if (v === undefined || v === null || (Array.isArray(v) && v.length === 0)) delete o[k];
  }
  return o;
};
const usDate = (s) => {
  // dataset dates are MM/DD/YYYY
  const m = typeof s === "string" && s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  return m ? `${m[3]}-${m[1]}-${m[2]}` : undefined;
};

// ---------- items ----------
const NUMERIC_STATS = [
  "damage", "fireRate", "range", "stability", "agility", "stealth",
  "damageMitigation", "shieldCharge", "durability", "movementSpeedModifier",
  "increasedFireRate", "reducedReloadTime", "reducedDurabilityBurnRate",
];
const itemFiles = fs.readdirSync(path.join(SRC, "items")).filter((f) => f.endsWith(".json"));
const items = itemFiles.map((f) => {
  const j = read(`items/${f}`);
  const stats = {};
  for (const k of NUMERIC_STATS) if (typeof j[k] === "number") stats[k] = j[k];
  // "effects" in the dataset mostly lists effect names; keep only entries that carry a real value.
  const effects = {};
  for (const [k, v] of Object.entries(j.effects ?? {})) {
    const val = en(v);
    if (val != null && String(val) !== k) effects[k] = String(val);
  }
  return prune({
    id: j.id,
    slug: slug(j.id),
    name: clean(en(j.name)),
    description: clean(en(j.description)),
    type: j.type,
    rarity: j.rarity,
    value: j.value,
    weightKg: j.weightKg,
    stackSize: j.stackSize,
    foundIn: splitList(j.foundIn),
    craftBench: list(j.craftBench),
    stationLevel: j.stationLevelRequired,
    craftQuantity: j.craftQuantity,
    recipe: pairs(j.recipe),
    recyclesInto: pairs(j.recyclesInto),
    salvagesInto: pairs(j.salvagesInto),
    upgradesTo: j.upgradesTo,
    upgradeCost: pairs(j.upgradeCost),
    repairCost: pairs(j.repairCost),
    blueprintLocked: j.blueprintLocked || undefined,
    isWeapon: j.isWeapon || undefined,
    questItem: j.questItem || undefined,
    compatibleWith: j.compatibleWith,
    modSlots: j.modSlots,
    stats: Object.keys(stats).length ? stats : undefined,
    effects: Object.keys(effects).length ? effects : undefined,
    vendors: j.vendors?.map((v) =>
      prune({
        trader: v.trader,
        cost: v.cost,
        limit: v.limit,
        refreshSeconds: v.refreshSeconds,
        requiredLevel: v.requiredLevel,
      }),
    ),
    tip: clean(en(j.tip)),
    addedIn: j.addedIn,
    updatedAt: usDate(j.updatedAt),
    image: fs.existsSync(path.join(SRC, "images/items", `${j.id}.png`)) ? `/img/items/${j.id}.png` : undefined,
  });
});
items.sort((a, b) => a.name.localeCompare(b.name));

// ---------- quests ----------
const quests = fs
  .readdirSync(path.join(SRC, "quests"))
  .filter((f) => f.endsWith(".json"))
  .map((f) => {
    const j = read(`quests/${f}`);
    return prune({
      id: j.id,
      slug: slug(j.id),
      name: clean(en(j.name)),
      trader: j.trader,
      maps: list(j.map),
      description: clean(en(j.description)),
      objectives: list(j.objectives).map((o) => clean(en(o))),
      objectivesOneRound: j.objectivesOneRound || undefined,
      requiredItems: reqList(j.requiredItemIds),
      grantedItems: reqList(j.grantedItemIds),
      rewards: reqList(j.rewardItemIds),
      xp: j.xp || undefined,
      previous: j.previousQuestIds,
      next: j.nextQuestIds,
      otherRequirements: list(j.otherRequirements).map((o) => clean(en(o))),
      updatedAt: usDate(j.updatedAt),
    });
  })
  .sort((a, b) => a.name.localeCompare(b.name));

// ---------- workshop ----------
const workshop = fs
  .readdirSync(path.join(SRC, "hideout"))
  .filter((f) => f.endsWith(".json"))
  .map((f) => {
    const j = read(`hideout/${f}`);
    return {
      id: j.id,
      name: clean(en(j.name)),
      maxLevel: j.maxLevel,
      levels: j.levels.map((l) => ({ level: l.level, requirements: reqList(l.requirementItemIds) ?? [] })),
    };
  });

// ---------- projects ----------
const projects = read("projects.json").map((p) =>
  prune({
    id: p.id,
    slug: slug(p.id),
    name: clean(en(p.name)),
    description: clean(en(p.description)),
    disabled: !!p.disabled,
    phases: p.phases.map((ph) =>
      prune({
        phase: ph.phase,
        name: clean(en(ph.name)),
        description: clean(en(ph.description)),
        items: ph.requirementItemIds?.map((r) =>
          prune({ id: r.itemId, qty: r.quantity, rewards: reqList(r.rewardItemIds) }),
        ),
        categories: ph.requirementCategories?.map((c) =>
          prune({
            category: clean(en(c.localizations) ?? c.category),
            kind: c.kind,
            valueRequired: c.valueRequired,
            tiers: c.tiers,
          }),
        ),
      }),
    ),
  }),
);

// ---------- bots / maps / trades / skills / events ----------
const bots = read("bots.json").map((b) =>
  prune({
    id: b.id,
    slug: slug(b.id.replace(/^arc_/, "")),
    name: clean(en(b.name)),
    type: b.type,
    threat: b.threat,
    description: clean(en(b.description)),
    weakness: clean(en(b.weakness)),
    maps: b.maps,
    destroyXp: b.destroyXp,
    lootXp: b.lootXp,
    drops: b.drops,
    image: fs.existsSync(path.join(SRC, "images/bots", `${b.id}.png`)) ? `/img/arc/${b.id}.png` : undefined,
  }),
);
const trades = read("trades.json").map((t) =>
  prune({
    trader: t.trader,
    itemId: t.itemId,
    qty: t.quantity,
    cost: t.cost ? { id: t.cost.itemId, qty: t.cost.quantity } : undefined,
    dailyLimit: t.dailyLimit ?? undefined,
  }),
);
const skills = read("skillNodes.json").map((s) =>
  prune({
    id: s.id,
    name: clean(en(s.name)),
    category: s.category,
    isMajor: !!s.isMajor,
    description: clean(en(s.description)),
    maxPoints: s.maxPoints,
    impactedSkill: clean(en(s.impactedSkill)),
    prerequisites: s.prerequisiteNodeIds,
    position: s.position,
  }),
);
const ev = read("map-events/map-events.json").eventTypes ?? {};
const mapEvents = Object.entries(ev).map(([id, e]) => ({ id, name: e.displayName, category: e.category }));

// ---------- write ----------
let commit = "unknown";
try {
  commit = execFileSync("git", ["-C", SRC, "log", "-1", "--format=%H %cI"], { encoding: "utf8" }).trim();
} catch {}
const meta = {
  source: "https://github.com/RaidTheory/arcraiders-data",
  license: "MIT",
  commit: commit.split(" ")[0],
  committedAt: commit.split(" ")[1],
  importedAt: new Date().toISOString(),
  counts: { items: items.length, quests: quests.length, bots: bots.length, projects: projects.length, trades: trades.length, skills: skills.length },
};
const write = (name, data) => fs.writeFileSync(path.join(OUT, `${name}.json`), JSON.stringify(data));
write("items", items);
write("quests", quests);
write("workshop", workshop);
write("projects", projects);
write("bots", bots);
write("trades", trades);
write("skills", skills);
write("map-events", mapEvents);
fs.writeFileSync(path.join(OUT, "meta.json"), JSON.stringify(meta, null, 2));

// ---------- images ----------
const copyDir = (from, to, filter = () => true) => {
  fs.mkdirSync(to, { recursive: true });
  let n = 0;
  for (const f of fs.readdirSync(from)) {
    if (!filter(f)) continue;
    fs.copyFileSync(path.join(from, f), path.join(to, f));
    n++;
  }
  return n;
};
const used = new Set(items.map((i) => `${i.id}.png`));
const nItems = copyDir(path.join(SRC, "images/items"), path.join(IMG, "items"), (f) => used.has(f));
const nBots = copyDir(path.join(SRC, "images/bots"), path.join(IMG, "arc"));
const nTraders = copyDir(path.join(SRC, "images/traders"), path.join(IMG, "traders"));
const nWorkshop = copyDir(path.join(SRC, "images/workshop"), path.join(IMG, "workshop"));

console.log(JSON.stringify(meta.counts), `images: items=${nItems} arc=${nBots} traders=${nTraders} workshop=${nWorkshop}`);
