/** Shared (client + server) helpers for the back-office item editor. */
import type { Item, Qty, Rarity } from "./types";

export const RARITY_OPTIONS: Rarity[] = ["Common", "Uncommon", "Rare", "Epic", "Legendary"];

/** Request "what is wrong?" choices → editor field names */
export const REQUEST_FIELD_MAP: Record<string, keyof EditorValues> = {
  Name: "name",
  Description: "description",
  Rarity: "rarity",
  Type: "type",
  "Sell value": "value",
  Weight: "weightKg",
  "Stack size": "stackSize",
  "Crafting recipe": "recipe",
  "Recycles into": "recyclesInto",
  "Salvages into": "salvagesInto",
  "Where to find": "foundIn",
  Image: "image",
};

/** Form values as strings, exactly as shown in the inputs. */
export interface EditorValues {
  id: string;
  name: string;
  description: string;
  type: string;
  rarity: string;
  value: string;
  weightKg: string;
  stackSize: string;
  foundIn: string;
  recipe: string;
  recyclesInto: string;
  salvagesInto: string;
  tip: string;
  image: string;
  hidden: string;
}

export const qtyToText = (list?: Qty[]) => (list ?? []).map((r) => `${r.id} x${r.qty}`).join("\n");

export function itemToValues(item?: Partial<Item>): EditorValues {
  return {
    id: item?.id ?? "",
    name: item?.name ?? "",
    description: item?.description ?? "",
    type: item?.type ?? "",
    rarity: item?.rarity ?? "",
    value: item?.value != null ? String(item.value) : "",
    weightKg: item?.weightKg != null ? String(item.weightKg) : "",
    stackSize: item?.stackSize != null ? String(item.stackSize) : "",
    foundIn: (item?.foundIn ?? []).join(", "),
    recipe: qtyToText(item?.recipe),
    recyclesInto: qtyToText(item?.recyclesInto),
    salvagesInto: qtyToText(item?.salvagesInto),
    tip: item?.tip ?? "",
    image: item?.image ?? "",
    hidden: item?.hidden ? "1" : "",
  };
}

/**
 * Parses "metal_parts x5" lines (also accepts "5x metal_parts", "metal_parts 5", commas).
 * Each id must exist; returns a friendly error otherwise.
 */
export function parseQtyList(text: string, exists: (id: string) => boolean): { list?: Qty[]; error?: string } {
  const parts = text.split(/[\n,]+/).map((s) => s.trim()).filter(Boolean);
  const list: Qty[] = [];
  for (const p of parts) {
    const m = p.match(/^(\d+)\s*x?\s+([a-z0-9_]+)$/i) ?? p.match(/^([a-z0-9_]+)\s*(?:x|×|\s)\s*(\d+)$/i);
    if (!m) return { error: `Could not read “${p}”. Use one entry per line like “metal_parts x5”.` };
    const [id, qty] = /^\d+$/.test(m[1]) ? [m[2], Number(m[1])] : [m[1], Number(m[2])];
    if (!exists(id.toLowerCase())) return { error: `Unknown item id “${id}”. Use the id shown on the item page (e.g. metal_parts).` };
    if (!(qty > 0) || qty > 100000) return { error: `Quantity for “${id}” must be a positive number.` };
    list.push({ id: id.toLowerCase(), qty });
  }
  return { list };
}

export const slugifyId = (name: string) =>
  name.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 60);
