export type Rarity = "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary";

export interface Qty {
  id: string;
  qty: number;
}

export interface Vendor {
  trader: string;
  cost?: Record<string, number>;
  limit?: number;
  refreshSeconds?: number;
  requiredLevel?: number;
}

export interface Item {
  id: string;
  slug: string;
  name: string;
  description?: string;
  type: string;
  rarity: Rarity;
  value: number;
  weightKg?: number;
  stackSize?: number;
  foundIn?: string[];
  craftBench?: string[];
  stationLevel?: number;
  craftQuantity?: number;
  recipe?: Qty[];
  recyclesInto?: Qty[];
  salvagesInto?: Qty[];
  upgradesTo?: string;
  upgradeCost?: Qty[];
  repairCost?: Qty[];
  blueprintLocked?: boolean;
  isWeapon?: boolean;
  questItem?: boolean;
  compatibleWith?: string[];
  modSlots?: Record<string, string[]>;
  stats?: Record<string, number>;
  effects?: Record<string, string>;
  vendors?: Vendor[];
  tip?: string;
  addedIn?: string;
  updatedAt?: string;
  image?: string;
}

export interface Quest {
  id: string;
  slug: string;
  name: string;
  trader: string;
  maps?: string[];
  description?: string;
  objectives: string[];
  objectivesOneRound?: boolean;
  requiredItems?: Qty[];
  grantedItems?: Qty[];
  rewards?: Qty[];
  xp?: number;
  previous?: string[];
  next?: string[];
  otherRequirements?: string[];
  updatedAt?: string;
}

export interface WorkshopStation {
  id: string;
  name: string;
  maxLevel: number;
  levels: { level: number; requirements: Qty[] }[];
}

export interface ProjectPhase {
  phase: number;
  name: string;
  description?: string;
  items?: (Qty & { rewards?: Qty[] })[];
  categories?: { category: string; kind?: string; valueRequired: number; tiers?: number[] }[];
}

export interface Project {
  id: string;
  slug: string;
  name: string;
  description?: string;
  disabled: boolean;
  phases: ProjectPhase[];
}

export interface Bot {
  id: string;
  slug: string;
  name: string;
  type: string;
  threat: "Low" | "Moderate" | "High" | "Critical" | "Extreme";
  description?: string;
  weakness?: string;
  maps?: string[];
  destroyXp?: number;
  lootXp?: number;
  drops?: string[];
  image?: string;
}

export interface Trade {
  trader: string;
  itemId: string;
  qty: number;
  cost?: Qty;
  dailyLimit?: number;
}

export interface SkillNode {
  id: string;
  name: string;
  category: "CONDITIONING" | "MOBILITY" | "SURVIVAL";
  isMajor: boolean;
  description?: string;
  maxPoints: number;
  impactedSkill?: string;
  prerequisites?: string[];
  position?: { x: number; y: number };
}

/** How much we trust a piece of information. Shown to readers on every entity. */
export type Confidence =
  | "verified" // two independent sources agree, or an official source
  | "dataset" // community-datamined dataset only
  | "pdf" // the v3.4 community cheat sheet only
  | "community" // community testing / guide sites
  | "conflict" // sources disagree
  | "strategy"; // our recommendation, not a fact

export interface SourceRef {
  id: string;
  title: string;
  url?: string;
  publisher: string;
  kind: "official" | "dataset" | "pdf" | "wiki" | "press" | "guide";
  date?: string; // published or last-edited date (ISO)
  accessed?: string;
  note?: string;
}
