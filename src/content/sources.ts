import type { SourceRef } from "@/lib/types";
import meta from "@/data/generated/meta.json";

const ACCESSED = "2026-10-27";

export const sources = {
  pdf: {
    id: "pdf",
    title: "ARC Raiders Master Cheat Sheet v3.4 (Recycling, Components, Keycards, Attachments)",
    publisher: "u/pRoDeeD (Reddit)",
    url: "https://ko-fi.com/prodeed",
    kind: "pdf",
    date: "2026-03-24",
    note: "5-page community cheat sheet supplied as the starting point for this site. Attachment values come from the author's in-game testing and are marked by the author as directional.",
  },
  dataset: {
    id: "dataset",
    title: "arcraiders-data — ARC Raiders game data in JSON",
    publisher: "RaidTheory / arctracker.io (MIT licence)",
    url: "https://github.com/RaidTheory/arcraiders-data",
    kind: "dataset",
    date: meta.committedAt?.slice(0, 10),
    accessed: ACCESSED,
    note: `Community-maintained, datamined game data. Imported at commit ${meta.commit.slice(0, 7)}. Predates the Frozen Trail update (8 Oct 2026).`,
  },
  wikiMaps: {
    id: "wikiMaps",
    title: "Maps",
    publisher: "ARC Raiders Wiki (arcraiders.wiki)",
    url: "https://arcraiders.wiki/wiki/Maps",
    kind: "wiki",
    date: "2026-10-18",
    accessed: ACCESSED,
  },
  wikiTraders: {
    id: "wikiTraders",
    title: "Traders",
    publisher: "ARC Raiders Wiki (arcraiders.wiki)",
    url: "https://arcraiders.wiki/wiki/Traders",
    kind: "wiki",
    date: "2026-10-09",
    accessed: ACCESSED,
  },
  wikiPatchnotes: {
    id: "wikiPatchnotes",
    title: "Patch notes",
    publisher: "ARC Raiders Wiki (arcraiders.wiki)",
    url: "https://arcraiders.wiki/wiki/Patchnotes",
    kind: "wiki",
    accessed: ACCESSED,
  },
  official: {
    id: "official",
    title: "ARC Raiders — official site and news",
    publisher: "Embark Studios",
    url: "https://arcraiders.com/news",
    kind: "official",
    accessed: ACCESSED,
  },
  extraction: {
    id: "extraction",
    title: "ARC Raiders extraction: elevators, hatches, and timers explained",
    publisher: "All Things How",
    url: "https://allthings.how/arc-raiders-extraction-elevators-hatches-and-timers-explained/",
    kind: "guide",
    date: "2025-11-07",
    accessed: ACCESSED,
  },
  frozenTrailShack: {
    id: "frozenTrailShack",
    title: "ARC Raiders outlines the Frozen Trail's new map, endgame, and features",
    publisher: "Shacknews",
    url: "https://shacknews.com/article/150801/arc-raiders-frozen-trail-feature-breakdown",
    kind: "press",
    date: "2026-09-23",
    accessed: ACCESSED,
  },
  frozenTrailLaunch: {
    id: "frozenTrailLaunch",
    title: "ARC Raiders Frozen Trail adds Pendola Pass and free play through Oct. 12",
    publisher: "God is a Geek",
    url: "https://godisageek.com/2026/10/arc-raiders-frozen-trail-update/",
    kind: "press",
    date: "2026-10-08",
    accessed: ACCESSED,
  },
  rivenTides: {
    id: "rivenTides",
    title: "ARC Raiders Riven Tides update: new map, enemies, and full patch notes",
    publisher: "Gfinity Esports",
    url: "https://www.gfinityesports.com/article/arc-raiders-riven-tides-update-new-map-enemies-and-full-patch-notes",
    kind: "press",
    date: "2026-04-28",
    accessed: ACCESSED,
  },
  patch145: {
    id: "patch145",
    title: "ARC Raiders: patches 1.45.0 and 1.46.0",
    publisher: "playnews.gg",
    url: "https://www.playnews.gg/de/guides/arc-raiders-was-sich-mit-den-patches-1-45-0-und-1-46-0-andert-letztes-live-update-vor-dem-8-oktober",
    kind: "press",
    date: "2026-09-15",
    accessed: ACCESSED,
  },
} satisfies Record<string, SourceRef>;

export type SourceId = keyof typeof sources;
export const allSources: SourceRef[] = Object.values(sources);
