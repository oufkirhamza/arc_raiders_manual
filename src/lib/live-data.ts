import "server-only";
import { cache } from "react";
import { baseItems, baseData, buildItemData, type ItemData } from "./data";
import { listEditsCached, type ItemEdit } from "./item-edits";
import type { Item } from "./types";

/** Fields the back office may change. Anything else in an edit is ignored. */
export const EDITABLE_FIELDS = [
  "name", "description", "type", "rarity", "value", "weightKg", "stackSize", "foundIn",
  "recipe", "recyclesInto", "salvagesInto", "craftBench", "stationLevel", "tip", "image", "hidden",
] as const satisfies readonly (keyof Item)[];

function pick(data: Partial<Item>) {
  const out: Partial<Item> = {};
  for (const k of EDITABLE_FIELDS) if (data[k] !== undefined) (out as Record<string, unknown>)[k] = data[k];
  return out;
}

export function applyEdits(base: Item[], edits: ItemEdit[]): Item[] {
  if (!edits.length) return base;
  const byId = new Map(edits.map((e) => [e.itemId, e]));
  const merged = base.map((it) => {
    const e = byId.get(it.id);
    if (!e || e.isNew) return it;
    return { ...it, ...pick(e.data), id: it.id, slug: it.slug, edited: { at: e.updatedAt } };
  });
  const baseIds = new Set(base.map((i) => i.id));
  for (const e of edits) {
    if (!e.isNew || baseIds.has(e.itemId)) continue;
    const d = pick(e.data);
    if (!d.name || !d.type || !d.rarity) continue;
    merged.push({ value: 0, ...d, name: d.name, type: d.type, rarity: d.rarity, id: e.itemId, slug: e.itemId.replace(/_/g, "-"), updatedAt: e.updatedAt.slice(0, 10), edited: { at: e.updatedAt, isNew: true } } as Item);
  }
  return merged.filter((i) => !i.hidden).sort((a, b) => a.name.localeCompare(b.name));
}

let memo: { key: string; data: ItemData } | undefined;

/**
 * Item data with the editor's changes applied. Edits are fetched through the Next data cache
 * (tag "item-edits"), so pages stay static and are regenerated only after an edit is saved.
 */
export const getData = cache(async (): Promise<ItemData> => {
  const edits = await listEditsCached();
  if (!edits.length) return baseData;
  const key = edits.map((e) => `${e.itemId}@${e.updatedAt}`).sort().join("|");
  if (memo?.key !== key) memo = { key, data: buildItemData(applyEdits(baseItems, edits)) };
  return memo.data;
});
