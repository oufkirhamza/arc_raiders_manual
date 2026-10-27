import type { Confidence } from "@/lib/types";
import type { SourceId } from "./sources";

export type Block =
  | { type: "p"; text: string }
  | { type: "list"; items: string[]; ordered?: boolean }
  | { type: "callout"; tone: "tip" | "warning" | "info"; title?: string; text: string }
  | { type: "table"; head: string[]; rows: string[][]; caption?: string }
  | { type: "items"; ids: string[]; caption?: string }
  | { type: "links"; links: { href: string; label: string; note?: string }[] };

export interface GuideSection {
  id: string;
  heading: string;
  confidence: Confidence;
  blocks: Block[];
}

export interface Guide {
  slug: string;
  title: string;
  summary: string;
  category: "Getting started" | "Economy" | "Combat" | "Progression" | "Maps & exploration" | "Updates";
  updated: string;
  sources: SourceId[];
  related?: string[];
  sections: GuideSection[];
}

export const guides: Guide[] = [
  {
    slug: "beginners-guide",
    title: "Beginner's guide to ARC Raiders",
    summary: "What the game is, how a raid works from start to finish, and what to focus on in your first hours.",
    category: "Getting started",
    updated: "2026-10-27",
    sources: ["official", "wikiMaps", "extraction", "dataset"],
    related: ["first-raid-checklist", "extraction-and-death", "beginner-mistakes"],
    sections: [
      {
        id: "what-is-it",
        heading: "What ARC Raiders is",
        confidence: "verified",
        blocks: [
          { type: "p", text: "ARC Raiders is a PvPvE extraction shooter from Embark Studios, released on 30 October 2025 for PC, PlayStation 5 and Xbox Series X|S. You play a Raider living in Speranza, an underground settlement, and travel Topside to scavenge a surface overrun by ARC — hostile machines — while competing with other Raiders who may help you or shoot you." },
          { type: "p", text: "You can raid solo or in a squad. Everything you carry Topside is at risk: you only keep what you extract with." },
        ],
      },
      {
        id: "core-loop",
        heading: "The core loop",
        confidence: "verified",
        blocks: [
          { type: "list", ordered: true, items: [
            "Prepare in Speranza: pick a loadout from your stash (or take a free loadout), and accept quests from traders.",
            "Deploy to a map. Raids are timed (about 30 minutes on standard conditions; some major conditions run 40).",
            "Loot containers, fight or avoid ARC, and decide how to deal with other Raiders.",
            "Extract before the timer runs out — through a public extraction point or a Raider Hatch.",
            "Back in Speranza: sell, recycle or craft; upgrade workshop stations; turn in quests; repeat.",
          ] },
          { type: "callout", tone: "info", title: "Why it matters", text: "Almost every progression system — workshop upgrades, quests, Expedition projects — consumes specific items. Learning what to keep and what to recycle is as important as winning fights." },
        ],
      },
      {
        id: "first-hours",
        heading: "What to focus on in your first hours",
        confidence: "strategy",
        blocks: [
          { type: "list", items: [
            "Learn Dam Battlegrounds first. The other maps unlock as you play more rounds (Buried City after 8, Spaceport after 12, Blue Gate after 18).",
            "Do trader quests as you go — they reward materials, gear and blueprints and point you at useful places on each map.",
            "Prioritise level-2 upgrades for the Gunsmith, Gear Bench and Medical Lab; they unlock better weapons, shields and healing.",
            "Do not sell everything. Check an item's page here before selling: if it is needed for an upgrade or a quest, keep it.",
            "Use free loadouts while learning. Losing them costs you nothing.",
          ] },
          { type: "links", links: [
            { href: "/workshop", label: "Workshop upgrade costs" },
            { href: "/quests", label: "Quest database" },
            { href: "/recycling", label: "Recycle or sell?" },
          ] },
        ],
      },
    ],
  },
  {
    slug: "first-raid-checklist",
    title: "First-raid checklist",
    summary: "A short pre-deployment checklist so your first trips Topside end with loot in the stash.",
    category: "Getting started",
    updated: "2026-10-27",
    sources: ["extraction", "dataset"],
    related: ["beginners-guide", "extraction-and-death"],
    sections: [
      {
        id: "before",
        heading: "Before you deploy",
        confidence: "strategy",
        blocks: [
          { type: "list", items: [
            "Weapon with spare ammo of the right type (light, medium, heavy or shotgun — check the weapon page).",
            "A shield if you have one, plus a few healing items (bandages) and a stamina item if available.",
            "Something valuable in your safe pocket slot, if your augment has one — that item survives death.",
            "Free inventory space. Arriving full means leaving loot behind.",
            "One or two active quests for the map you are about to play.",
          ] },
        ],
      },
      {
        id: "during",
        heading: "During the raid",
        confidence: "strategy",
        blocks: [
          { type: "list", items: [
            "Open your map early and note which extraction points are active and how long they stay open.",
            "Move between cover; ARC like the Sentinel and Rocketeer punish open ground.",
            "Shooting is loud. Every fight can draw other Raiders and more ARC.",
            "Decide on an exit while you still have time and health — not when the timer is about to expire.",
          ] },
          { type: "callout", tone: "warning", title: "Extraction alarm", text: "Calling a public elevator sets off a loud alarm that attracts ARC and other Raiders. Scout the area first and be ready to defend it." },
        ],
      },
    ],
  },
  {
    slug: "extraction-and-death",
    title: "Extraction, death and what you keep",
    summary: "How public extracts and Raider Hatches work, and what happens to your gear when you go down.",
    category: "Getting started",
    updated: "2026-10-27",
    sources: ["extraction", "dataset"],
    related: ["keycards-and-locked-rooms", "first-raid-checklist"],
    sections: [
      {
        id: "public-extracts",
        heading: "Public extraction points",
        confidence: "community",
        blocks: [
          { type: "table", head: ["Map", "Public extract"], rows: [
            ["Dam Battlegrounds", "Cargo elevators"],
            ["The Spaceport", "Cargo elevators"],
            ["Buried City", "Metro stations"],
            ["The Blue Gate", "Air shafts"],
          ], caption: "Per All Things How (Nov 2025). Riven Tides, Stella Montis and Pendola Pass are not covered by that source." },
          { type: "list", items: [
            "Each public extract has its own shutdown timer. When it reaches zero, that exit closes for the rest of the raid. Active exits are marked on the map.",
            "Call it at the outside terminal, then use the interior console once the doors open. The call alarm is loud.",
            "Downed players can still crawl inside; extraction completes for anyone inside when it departs.",
          ] },
        ],
      },
      {
        id: "raider-hatches",
        heading: "Raider Hatches",
        confidence: "community",
        blocks: [
          { type: "p", text: "Raider Hatches are a quiet alternative: they open without an alarm but consume one single-use Raider Hatch Key. The hatch closes again after a short window, and other players can follow you in if they reach it in time." },
          { type: "items", ids: ["raider_hatch_key"], caption: "Sold by Shani, craftable at the Utility Station, found in raids." },
          { type: "callout", tone: "tip", text: "Keep your hatch key in your safe pocket so it survives if you are downed and killed." },
        ],
      },
      {
        id: "death",
        heading: "When you die",
        confidence: "community",
        blocks: [
          { type: "p", text: "Anything in your regular inventory is lost if you die before extracting — weapons, materials, blueprints and quest items. Items in a safe pocket are kept. You can always redeploy with a free loadout." },
        ],
      },
    ],
  },
  {
    slug: "beginner-mistakes",
    title: "Common beginner mistakes",
    summary: "The habits that cost new Raiders the most loot and progress — and what to do instead.",
    category: "Getting started",
    updated: "2026-10-27",
    sources: ["pdf", "dataset", "extraction"],
    related: ["recycling-vs-selling", "workshop-upgrade-priority"],
    sections: [
      {
        id: "mistakes",
        heading: "Mistakes to avoid",
        confidence: "strategy",
        blocks: [
          { type: "table", head: ["Mistake", "Do this instead"], rows: [
            ["Selling quest and upgrade items for quick coins", "Check “Needed for” on the item page; the Keep-for-Quests list and workshop costs show what to hold."],
            ["Recycling everything", "Recycling usually returns less coin value than selling (often −40% to −60% for high-priority components). Recycle when you need the materials."],
            ["Bringing your best gear while learning a map", "Use free loadouts or cheap kits until you know the routes and extracts."],
            ["Waiting until the last minute to extract", "Exits shut down over time. Leave with a margin."],
            ["Fighting every ARC you see", "Big ARC cost ammo and attention. Pick fights that reward you (quests, valuable drops)."],
            ["Keeping keys in your backpack", "Store keys and hatch keys in your safe pocket."],
          ] },
        ],
      },
    ],
  },
  {
    slug: "recycling-vs-selling",
    title: "Recycle or sell? The Recycling Value Index",
    summary: "How to decide whether an item is worth more as coins or as crafting materials, using the cheat sheet's ROI formula.",
    category: "Economy",
    updated: "2026-10-27",
    sources: ["pdf", "dataset"],
    related: ["workshop-upgrade-priority", "beginner-mistakes"],
    sections: [
      {
        id: "formula",
        heading: "The formula",
        confidence: "verified",
        blocks: [
          { type: "p", text: "The Recycling Value Index compares the coin value of what an item recycles into with what the item sells for:" },
          { type: "callout", tone: "info", title: "ROI %", text: "(Recycle value − Sell value) ÷ Sell value × 100" },
          { type: "table", head: ["Example", "Value"], rows: [
            ["Synthesized Fuel sells for", "700"],
            ["Recycles into 1× Oil (300) + 1× Chemicals (50)", "350"],
            ["ROI", "−50%"],
          ], caption: "Worked example printed on the cheat sheet." },
          { type: "p", text: "A positive ROI means recycling returns more value than selling; a negative ROI means you lose value by recycling. This site computes ROI for every recyclable item from current dataset values." },
        ],
      },
      {
        id: "patterns",
        heading: "Patterns worth knowing",
        confidence: "pdf",
        blocks: [
          { type: "list", items: [
            "High-priority components carry a big recycling penalty (around −40% to −60%). Low-priority items often lose only −10% to −25%.",
            "A few items recycle for more than they sell for — the cheat sheet calls out Wasp Driver (+63%).",
            "Recycle with a purpose: when you need a material for a craft or upgrade, recycling a donor is still the fastest source.",
          ] },
          { type: "links", links: [{ href: "/recycling", label: "Open the recycling table", note: "Sortable ROI for every recyclable item" }] },
        ],
      },
    ],
  },
  {
    slug: "workshop-upgrade-priority",
    title: "Workshop upgrades: what to collect",
    summary: "Every level-2 and level-3 station cost in one place, and the items worth hoarding for them.",
    category: "Progression",
    updated: "2026-10-27",
    sources: ["pdf", "dataset"],
    related: ["recycling-vs-selling", "expeditions-explained"],
    sections: [
      {
        id: "stations",
        heading: "Stations",
        confidence: "verified",
        blocks: [
          { type: "p", text: "Workshop stations in Speranza craft different item families: Gunsmith (weapons and mods), Gear Bench (shields and augments), Medical Lab (healing), Explosives Station (grenades), Utility Station (gadgets and keys) and the Refiner (refined materials). Scrappy is upgraded with food and comfort items. Upgrading a station unlocks higher-tier recipes." },
          { type: "links", links: [{ href: "/workshop", label: "Full upgrade costs by station" }] },
        ],
      },
      {
        id: "priority",
        heading: "Suggested priority",
        confidence: "strategy",
        blocks: [
          { type: "list", ordered: true, items: [
            "Gunsmith 2 — better weapons and mods. Needs Wasp Drivers (from Wasps), so start collecting early.",
            "Gear Bench 2 — better shields. Needs Hornet Drivers.",
            "Medical Lab 2 — better healing. Needs Tick Pods and Cracked Bioscanners.",
            "Refiner 2 — turns common materials into the refined ones everything else needs.",
            "Utility and Explosives as your playstyle requires.",
          ] },
          { type: "callout", tone: "tip", text: "ARC parts (drivers, cells, cores) are the usual bottleneck. If a quest or upgrade needs one, hunt that ARC type deliberately." },
        ],
      },
    ],
  },
  {
    slug: "attachments-explained",
    title: "Weapon attachments explained",
    summary: "What grips, compensators, silencers, barrels and stocks actually change — with tested percentages.",
    category: "Combat",
    updated: "2026-10-27",
    sources: ["pdf", "dataset"],
    related: ["loadouts"],
    sections: [
      {
        id: "summary",
        heading: "Quick reference",
        confidence: "pdf",
        blocks: [
          { type: "table", head: ["Attachment", "Improves", "Best on"], rows: [
            ["Angled Grip I–III", "Horizontal recoil −20% / −30% / −40%", "Fast-firing guns (Kettle, Stitcher, Bobcat)"],
            ["Vertical Grip I–III", "Vertical recoil −20% / −30% / −40%", "Fast-firing guns"],
            ["Horizontal Grip", "Horizontal and vertical recoil −30%", "Fast-firing guns"],
            ["Compensator I–III", "Max-shot dispersion −15% / −20% / −25%", "Sustained fire"],
            ["Silencer I–III", "Noise reduction 20% / 40% / 60%", "Stealthy play"],
            ["Extended Barrel", "Bullet velocity +25%", "Long-range guns (Ferro, Anvil, Osprey, Renegade)"],
            ["Stable Stock I–III", "Faster recoil and dispersion recovery; III adds +20% equip time", "Any"],
            ["Lightweight Stock", "Equip time −30%, slower recoil recovery", "Swap-heavy loadouts"],
          ], caption: "Values from the v3.4 cheat sheet's in-game testing; the author marks timing values as directional." },
          { type: "links", links: [{ href: "/attachments", label: "Full attachments page with recovery timings and magazine sizes" }] },
        ],
      },
    ],
  },
  {
    slug: "loadouts",
    title: "Loadout recommendations",
    summary: "Practical starter, mid-game and stealth loadouts built from craftable gear.",
    category: "Combat",
    updated: "2026-10-27",
    sources: ["dataset", "pdf"],
    related: ["attachments-explained", "fighting-arc"],
    sections: [
      {
        id: "principles",
        heading: "Principles",
        confidence: "strategy",
        blocks: [
          { type: "list", items: [
            "Pair a close-range gun with a mid/long-range gun so one weapon always fits the fight.",
            "Match ammo types where you can, to save inventory space.",
            "Bring enough healing to recover from one bad fight, and a shield if you have one.",
            "Only bring what you are prepared to lose.",
          ] },
        ],
      },
      {
        id: "builds",
        heading: "Example loadouts",
        confidence: "strategy",
        blocks: [
          { type: "table", head: ["Role", "Primary", "Secondary", "Why"], rows: [
            ["Starter / free-kit", "Stitcher or Kettle", "Ferro", "Cheap to craft from Metal and Rubber Parts; Ferro hits hard at range."],
            ["Mid-game all-rounder", "Arpeggio or Tempest", "Renegade or Osprey", "Medium-ammo automatic plus a precise medium-ammo rifle."],
            ["Close quarters (Buried City, Stella Montis)", "Il Toro or Vulcano", "Bobcat", "Shotgun burst plus a fast-firing SMG."],
            ["Quiet looter", "Any weapon with Silencer II–III", "—", "Silencers cut how far your shots carry."],
          ] },
          { type: "links", links: [{ href: "/weapons", label: "Compare all weapon families" }] },
        ],
      },
    ],
  },
  {
    slug: "fighting-arc",
    title: "Fighting ARC: threat levels and tactics",
    summary: "How to read ARC threat ratings, use weak points, and decide which machines are worth engaging.",
    category: "Combat",
    updated: "2026-10-27",
    sources: ["dataset"],
    related: ["loadouts"],
    sections: [
      {
        id: "threat",
        heading: "Threat levels",
        confidence: "dataset",
        blocks: [
          { type: "p", text: "The dataset rates every ARC from Low to Extreme. Low/Moderate machines (Surveyor, Snitch, Tick, Pop, Wasp, Turret) are manageable solo with basic gear. High (Hornet, Spotter, Sentinel, Fireball, Shredder) need cover and focus. Critical (Bastion, Bombardier, Leaper, Rocketeer) and Extreme bosses (Matriarch, The Queen) are squad-level fights." },
          { type: "links", links: [{ href: "/enemies", label: "ARC database with weaknesses and drops" }] },
        ],
      },
      {
        id: "tactics",
        heading: "General tactics",
        confidence: "strategy",
        blocks: [
          { type: "list", items: [
            "Break line of sight from scouts (Snitch, Spotter) before they call in reinforcements.",
            "Aim for listed weak points — e.g. the canister on a Bastion's rear exposes its weak point.",
            "Fights make noise. Kill quickly or disengage; long fights attract Raiders.",
            "Loot what you came for. ARC drop the parts needed for workshop upgrades and quests.",
          ] },
        ],
      },
    ],
  },
  {
    slug: "solo-and-squad",
    title: "Solo, duo and squad play",
    summary: "How to adjust your approach depending on whether you raid alone or with friends.",
    category: "Combat",
    updated: "2026-10-27",
    sources: [],
    related: ["fighting-arc", "loadouts"],
    sections: [
      {
        id: "solo",
        heading: "Solo",
        confidence: "strategy",
        blocks: [
          { type: "list", items: [
            "Avoid Critical and Extreme ARC unless a quest requires them.",
            "Use sound: listen before entering buildings and before calling an extract.",
            "Carry a Raider Hatch Key to skip contested public extracts.",
          ] },
        ],
      },
      {
        id: "squad",
        heading: "Duo and trio",
        confidence: "strategy",
        blocks: [
          { type: "list", items: [
            "Split roles: one player scouts and calls targets, one carries the long-range weapon.",
            "Revive quickly but clear the threat first.",
            "Share quest items and loot plans before deploying so you route to the same places.",
          ] },
        ],
      },
    ],
  },
  {
    slug: "expeditions-explained",
    title: "Expedition projects explained",
    summary: "What the multi-phase Expedition projects ask for and how to prepare for them.",
    category: "Progression",
    updated: "2026-10-27",
    sources: ["pdf", "dataset"],
    related: ["workshop-upgrade-priority", "recycling-vs-selling"],
    sections: [
      {
        id: "structure",
        heading: "Structure",
        confidence: "verified",
        blocks: [
          { type: "p", text: "Each Expedition project has six phases. Phases 1–4 (Foundation, Core Systems, Framework, Outfitting) each ask for four specific items. Phase 5, the Load Stage, asks you to turn in items by category — Combat, Survival, Provisions and Materials — up to a total coin value per category. Phase 6 (Departure) tracks ARC damage dealt, in tiers up to 100,000." },
          { type: "callout", tone: "warning", title: "Sources disagree on some numbers", text: "The v3.4 cheat sheet and the dataset differ on a few Expedition values (for example the Expedition 1 Load Stage totals). Each project page shows both and flags the difference." },
          { type: "links", links: [{ href: "/projects", label: "All projects" }, { href: "/sources#conflicts", label: "Known data conflicts" }] },
        ],
      },
    ],
  },
  {
    slug: "keycards-and-locked-rooms",
    title: "Keycards and locked rooms",
    summary: "Which keys open what on each map, and how to use them without losing them.",
    category: "Maps & exploration",
    updated: "2026-10-27",
    sources: ["pdf", "dataset"],
    related: ["extraction-and-death"],
    sections: [
      {
        id: "how",
        heading: "How keys work",
        confidence: "dataset",
        blocks: [
          { type: "p", text: "Map keys open a specific locked room on one map. Keys are found in raids and some are quest rewards. The Blue Gate's Locked Gate condition uses four security codes found around the map; the Spaceport's Hidden Bunker uses a makeshift Hidden Bunker Key." },
          { type: "callout", tone: "tip", text: "Carry keys in your safe pocket and check the key page for the exact room before you deploy." },
          { type: "links", links: [{ href: "/keys", label: "Every key, grouped by map" }] },
        ],
      },
    ],
  },
  {
    slug: "frozen-trail-whats-new",
    title: "Frozen Trail: what's new",
    summary: "The October 2026 expansion — Pendola Pass, the ARC Frigate, new ARC and gear — and what this site does not cover yet.",
    category: "Updates",
    updated: "2026-10-27",
    sources: ["frozenTrailShack", "frozenTrailLaunch", "wikiMaps"],
    related: ["beginners-guide"],
    sections: [
      {
        id: "additions",
        heading: "Additions",
        confidence: "community",
        blocks: [
          { type: "list", items: [
            "Pendola Pass: a snowbound Exodus transit hub (difficulty 3, unlocks after 25 rounds).",
            "Flash Freeze weather and Avalanche Shelters.",
            "The ARC Frigate: an endgame scenario where you sabotage a patrolling vessel from the inside — other Raiders may cooperate or attack.",
            "New ARC: Bully, Skulker, Hydra.",
            "New weapons Bantam and Stiletto and an Amplified Weapons system.",
            "Gadgets: Grappling Hook, Tether Launcher, Yank Grenade, cameras, Mountaineer's Detector.",
            "Reward Pass, reworked skill tree, Research Bench and 22 new quests (reported at launch).",
          ] },
          { type: "callout", tone: "warning", title: "Coverage gap", text: "The item, quest and skill data on this site comes from a dataset snapshot from 18 August 2026. Frozen Trail items, quests and the reworked skill tree are not in it yet, so they have no detail pages here." },
        ],
      },
    ],
  },
];
