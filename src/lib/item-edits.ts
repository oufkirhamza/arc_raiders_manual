import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import { randomBytes } from "node:crypto";
import { unstable_cache } from "next/cache";
import type { Item } from "./types";
import { IMAGE_BUCKET, assertOk, supabase } from "./supabase";
import { LOCAL_DIR, localJson } from "./local-store";

/**
 * Editor changes layered over the imported dataset.
 * - override (isNew=false): `data` holds only the changed fields of a dataset item
 * - new item (isNew=true): `data` is a complete item missing from the dataset
 */
export interface ItemEdit {
  itemId: string;
  isNew: boolean;
  data: Partial<Item>;
  note?: string;
  updatedAt: string;
}

export const EDITS_TAG = "item-edits";
const local = localJson<ItemEdit[]>("item-edits.json", []);

type Row = { item_id: string; is_new: boolean; data: Partial<Item>; note: string | null; updated_at: string };
const fromRow = (r: Row): ItemEdit => ({ itemId: r.item_id, isNew: r.is_new, data: r.data, note: r.note ?? undefined, updatedAt: r.updated_at });

export async function listEdits(): Promise<ItemEdit[]> {
  const db = supabase();
  if (db) return (assertOk(await db.from("item_edits").select("*"), "list item edits") ?? []).map((r) => fromRow(r as Row));
  return local.read();
}

/** Cached across requests; invalidated with revalidateTag(EDITS_TAG) whenever an edit is saved. */
export const listEditsCached = unstable_cache(listEdits, ["item-edits-v1"], { tags: [EDITS_TAG] });

export async function getEdit(itemId: string) {
  return (await listEdits()).find((e) => e.itemId === itemId);
}

export async function saveEdit(edit: Omit<ItemEdit, "updatedAt">) {
  const updatedAt = new Date().toISOString();
  const db = supabase();
  if (db) {
    assertOk(
      await db.from("item_edits").upsert({ item_id: edit.itemId, is_new: edit.isNew, data: edit.data, note: edit.note ?? null, updated_at: updatedAt }),
      "save item edit",
    );
    return;
  }
  await local.update((list) => [...list.filter((e) => e.itemId !== edit.itemId), { ...edit, updatedAt }]);
}

export async function deleteEdit(itemId: string) {
  const db = supabase();
  if (db) {
    assertOk(await db.from("item_edits").delete().eq("item_id", itemId), "delete item edit");
    return;
  }
  await local.update((list) => list.filter((e) => e.itemId !== itemId));
}

// ---------- images ----------
export const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
const TYPES: Record<string, string> = { "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp" };

/** Checks the file's magic bytes, not just the browser-supplied MIME type. */
function sniff(buf: Buffer): string | undefined {
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "image/png";
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "image/jpeg";
  if (buf.subarray(0, 4).toString("ascii") === "RIFF" && buf.subarray(8, 12).toString("ascii") === "WEBP") return "image/webp";
  return undefined;
}

export async function uploadItemImage(file: File, itemId: string): Promise<string> {
  if (file.size > MAX_IMAGE_BYTES) throw new Error("Image is larger than 2 MB.");
  const buf = Buffer.from(await file.arrayBuffer());
  const type = sniff(buf);
  if (!type) throw new Error("Only PNG, JPEG or WebP images are allowed.");
  const name = `${itemId.replace(/[^a-z0-9_-]/gi, "")}-${Date.now().toString(36)}${randomBytes(2).toString("hex")}.${TYPES[type]}`;

  const db = supabase();
  if (db) {
    assertOk(await db.storage.from(IMAGE_BUCKET).upload(name, buf, { contentType: type, cacheControl: "31536000", upsert: false }), "upload image");
    return db.storage.from(IMAGE_BUCKET).getPublicUrl(name).data.publicUrl;
  }
  const dir = path.join(LOCAL_DIR, "uploads");
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, name), buf);
  return `/local-uploads/${name}`;
}

/** Removes an uploaded image that is no longer referenced (best effort). */
export async function deleteItemImage(url: string | undefined) {
  if (!url) return;
  const db = supabase();
  try {
    if (db && url.includes(`/storage/v1/object/public/${IMAGE_BUCKET}/`)) {
      await db.storage.from(IMAGE_BUCKET).remove([url.split(`/${IMAGE_BUCKET}/`)[1]]);
    } else if (url.startsWith("/local-uploads/")) {
      await fs.unlink(path.join(LOCAL_DIR, "uploads", path.basename(url)));
    }
  } catch (e) {
    console.warn("Could not delete old image", e);
  }
}
