import type { Confidence } from "@/lib/types";
import type { SourceId } from "./sources";

export interface MapInfo {
  slug: string;
  name: string;
  /** ids used by the dataset (bots use per-floor ids for Stella Montis; quests use "stella_montis") */
  datasetIds: string[];
  image?: { src: string; alt: string }[];
  difficulty?: number;
  unlock?: string;
  summary: string;
  extraction?: { text: string; confidence: Confidence; sources: SourceId[] };
  conditions?: { name: string; kind: "major" | "minor"; note?: string }[];
  added?: string;
  sources: SourceId[];
}

export const maps: MapInfo[] = [
  {
    slug: "dam-battlegrounds",
    name: "Dam Battlegrounds",
    datasetIds: ["dam_battlegrounds"],
    image: [{ src: "/img/maps/dam-battlegrounds.webp", alt: "Top-down overview of Dam Battlegrounds" }],
    difficulty: 2,
    unlock: "Available from the start",
    summary: "A waterlogged, toxic area around a former power plant (the Alcantara Power Plant, “The Dam”). The usual first map for new Raiders.",
    extraction: { text: "Public extracts are cargo elevators.", confidence: "community", sources: ["extraction"] },
    sources: ["wikiMaps", "pdf", "dataset"],
  },
  {
    slug: "buried-city",
    name: "Buried City",
    datasetIds: ["buried_city"],
    image: [{ src: "/img/maps/buried-city.webp", alt: "Top-down overview of Buried City" }],
    difficulty: 3,
    unlock: "8 rounds played",
    summary: "Sand-dune ruins of an Italian town with narrow streets and empty plazas — dense, close-quarters looting.",
    extraction: { text: "Public extracts are metro stations.", confidence: "community", sources: ["extraction"] },
    conditions: [{ name: "Bird City", kind: "minor" }],
    sources: ["wikiMaps", "pdf", "dataset"],
  },
  {
    slug: "the-spaceport",
    name: "The Spaceport",
    datasetIds: ["the_spaceport"],
    image: [{ src: "/img/maps/the-spaceport.webp", alt: "Top-down overview of The Spaceport" }],
    difficulty: 3,
    unlock: "12 rounds played",
    summary: "A former launch site for Exodus shuttles: hangars, launch towers and long sightlines across open ground.",
    extraction: { text: "Public extracts are cargo elevators.", confidence: "community", sources: ["extraction"] },
    conditions: [{ name: "Hidden Bunker", kind: "major", note: "Extends the match to 40 minutes. Uses the Hidden Bunker Key." }],
    sources: ["wikiMaps", "pdf", "dataset"],
  },
  {
    slug: "the-blue-gate",
    name: "The Blue Gate",
    datasetIds: ["the_blue_gate"],
    image: [{ src: "/img/maps/the-blue-gate.webp", alt: "Top-down overview of The Blue Gate" }],
    difficulty: 4,
    unlock: "18 rounds played",
    summary: "A gateway into the mountain ranges and a scarred valley, with tunnels, a village and scattered outposts.",
    extraction: { text: "Public extracts are air shafts.", confidence: "community", sources: ["extraction"] },
    conditions: [{ name: "Locked Gate", kind: "major", note: "Extends the match to 40 minutes. Four security codes (Ancient Fort, Pilgrim's Peak, Raider's Refuge, Reinforced Reception) unlock the gate." }],
    sources: ["wikiMaps", "pdf", "dataset"],
  },
  {
    slug: "stella-montis",
    name: "Stella Montis",
    datasetIds: ["stella_montis", "stella_montis_upper", "stella_montis_lower"],
    image: [
      { src: "/img/maps/stella-montis-upper.webp", alt: "Stella Montis upper level layout" },
      { src: "/img/maps/stella-montis-lower.webp", alt: "Stella Montis lower level layout" },
    ],
    difficulty: 4,
    unlock: "24 rounds played",
    summary: "A snowy, secluded research facility split across upper and lower levels — mostly indoor corridors, labs and cargo docks.",
    sources: ["wikiMaps", "pdf", "dataset"],
  },
  {
    slug: "riven-tides",
    name: "Riven Tides",
    datasetIds: ["riven_tides"],
    image: [{ src: "/img/maps/riven-tides.webp", alt: "Top-down overview of Riven Tides" }],
    difficulty: 5,
    unlock: "20 rounds played",
    added: "2026-04-28",
    summary: "A coastal harbor resort “abandoned twice”: the Exodus port, the Port Authority Building and the Hotel Panorama Azzurro with its beach, restaurant and tennis courts.",
    conditions: [{ name: "Beachcombing", kind: "minor", note: "Use the Dockmaster's Detector to dig up loot buried along the coast." }],
    sources: ["wikiMaps", "rivenTides", "dataset"],
  },
  {
    slug: "pendola-pass",
    name: "Pendola Pass",
    datasetIds: ["pendola_pass"],
    difficulty: 3,
    unlock: "25 rounds played",
    added: "2026-10-08",
    summary: "A snowbound Exodus transit hub high above the Rust Belt, built around a summit observatory. Added in the Frozen Trail update with Flash Freeze weather and the ARC Frigate endgame scenario.",
    conditions: [
      { name: "Flash Freeze", kind: "major", note: "Dynamic freezing weather; Avalanche Shelters activate as a freeze approaches (reported at launch)." },
      { name: "ARC Frigate", kind: "major", note: "Sabotage a patrolling ARC vessel from the inside." },
    ],
    sources: ["wikiMaps", "frozenTrailShack", "frozenTrailLaunch"],
  },
];

export const practiceRange = { name: "Practice Range", unlock: "4 rounds played", note: "A mountain hollow for practice with a 2-hour duration." };

export interface TraderInfo {
  slug: string;
  name: string;
  role: string;
  currency: string;
  sells: string[];
  summary: string;
  image?: string;
  inDataset: boolean;
  sources: SourceId[];
}

export const traders: TraderInfo[] = [
  {
    slug: "celeste",
    name: "Celeste",
    role: "Barter trader",
    currency: "Assorted Seeds",
    sells: ["Basic materials", "Topside materials"],
    summary: "Swaps raw crafting materials for Assorted Seeds. Also hands out a long line of story quests investigating ARC behaviour.",
    image: "/img/traders/celeste.png",
    inDataset: true,
    sources: ["wikiTraders", "dataset"],
  },
  {
    slug: "shani",
    name: "Shani",
    role: "Security",
    currency: "Coins",
    sells: ["Augments", "Weapon mods", "Medical items", "Raider Hatch Key"],
    summary: "Speranza's security lead. The most prolific quest-giver, and the trader to visit for Raider Hatch Keys.",
    image: "/img/traders/shani.png",
    inDataset: true,
    sources: ["wikiTraders", "dataset"],
  },
  {
    slug: "tian-wen",
    name: "Tian Wen",
    role: "Gun shop",
    currency: "Coins",
    sells: ["Weapons", "Ammunition", "Weapon mods"],
    summary: "Runs the gun shop. Higher-tier stock unlocks as your trader level rises.",
    image: "/img/traders/tianwen.png",
    inDataset: true,
    sources: ["wikiTraders", "dataset"],
  },
  {
    slug: "lance",
    name: "Lance",
    role: "Clinic",
    currency: "Coins (plus a free loadout augment)",
    sells: ["Augments", "Shields", "Medical items"],
    summary: "Runs the clinic: healing items, shields and augments.",
    image: "/img/traders/lance.png",
    inDataset: true,
    sources: ["wikiTraders", "dataset"],
  },
  {
    slug: "apollo",
    name: "Apollo",
    role: "Grenades & gadgets",
    currency: "Coins",
    sells: ["Gadgets", "Grenades"],
    summary: "Sells throwables and utility gadgets.",
    image: "/img/traders/apollo.png",
    inDataset: true,
    sources: ["wikiTraders", "dataset"],
  },
  {
    slug: "nomadic-envoys",
    name: "Nomadic Envoys",
    role: "Resource trader",
    currency: "Resources",
    sells: ["Extra stash space", "Expedition Vault", "Cosmetics", "Resources", "Blueprints"],
    summary: "Listed by the community wiki as a resource trader. Not yet covered by the imported dataset, so no inventory is shown here.",
    inDataset: false,
    sources: ["wikiTraders"],
  },
];

export interface UpdateEntry {
  date: string;
  title: string;
  version?: string;
  points: string[];
  confidence: Confidence;
  sources: SourceId[];
}

export const updates: UpdateEntry[] = [
  {
    date: "2026-10-08",
    title: "Frozen Trail",
    version: "2.0",
    points: [
      "New map: Pendola Pass, a snowbound Exodus transit hub with Flash Freeze weather and Avalanche Shelters.",
      "ARC Frigate endgame scenario: sabotage a patrolling vessel from the inside.",
      "New ARC: Bully, Skulker and Hydra (Hydra appears in the Frigate).",
      "New weapons Bantam and Stiletto, plus an Amplified Weapons system.",
      "New gear reported at launch: Grappling Hook, Tether Launcher, Yank Grenade, Basic/Advanced Cameras, Mountaineer's Detector.",
      "22 new quests, a Reward Pass, a reworked skill tree and a Research Bench in the Outpost (reported at launch).",
      "Free-play weekend 8–12 October 2026.",
    ],
    confidence: "community",
    sources: ["frozenTrailShack", "frozenTrailLaunch"],
  },
  {
    date: "2026-09-15",
    title: "Store update",
    version: "1.46.0",
    points: ["Cosmetic-only update (Boonie Set colour variants); teased Frozen Trail."],
    confidence: "community",
    sources: ["patch145"],
  },
  {
    date: "2026-09-08",
    title: "Live update",
    version: "1.45.0",
    points: ["Snitch Scanner fix, Aphelion stability fixes, engine moved to Unreal Engine 5.7, quality-of-life changes."],
    confidence: "community",
    sources: ["patch145"],
  },
  {
    date: "2026-08-18",
    title: "Dataset snapshot used by this site",
    points: ["Item, quest, workshop, project, trade, ARC and skill data on this site comes from this snapshot. Frozen Trail content is not in it yet."],
    confidence: "dataset",
    sources: ["dataset"],
  },
  {
    date: "2026-04-28",
    title: "Riven Tides",
    version: "1.26.0",
    points: [
      "New map: Riven Tides (coastal harbor resort, Hotel Panorama Azzurro).",
      "New ARC: the Turbine, a large flying machine you track down and hunt.",
      "Beachcombing map condition with the Dockmaster's Detector.",
      "New gear: Powered Descender, Crash Mat, White Flag, Dockmaster's Detector.",
      "Weapon economy: found weapons spawn with lower average durability outside closed rooms; upgrading a weapon repairs 25% of its max durability.",
      "Last Resort event (28 April – 25 May 2026).",
    ],
    confidence: "community",
    sources: ["rivenTides"],
  },
  {
    date: "2026-03-24",
    title: "Master Cheat Sheet v3.4",
    points: ["The community cheat sheet this site was built from (Expedition Projects 1–3, recycling, donors, keycards, attachments)."],
    confidence: "pdf",
    sources: ["pdf"],
  },
];

/** ARC known from patch coverage but missing from the dataset. Shown as stubs without stats. */
export const undocumentedArc: { name: string; note: string; added: string; sources: SourceId[] }[] = [
  { name: "Turbine", note: "Large flying ARC on Riven Tides that you track and hunt for its loot.", added: "2026-04-28", sources: ["rivenTides"] },
  { name: "Bully", note: "Announced for Frozen Trail. No verified behaviour details yet.", added: "2026-10-08", sources: ["frozenTrailShack"] },
  { name: "Skulker", note: "Announced for Frozen Trail. No verified behaviour details yet.", added: "2026-10-08", sources: ["frozenTrailShack"] },
  { name: "Hydra", note: "Encountered inside the ARC Frigate (Frozen Trail). No verified behaviour details yet.", added: "2026-10-08", sources: ["frozenTrailShack"] },
];
