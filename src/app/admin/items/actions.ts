"use server";

import { redirect } from "next/navigation";
import { revalidatePath, revalidateTag } from "next/cache";
import { requireAdmin } from "@/lib/admin-session";
import { baseData } from "@/lib/data";
import { getData, EDITABLE_FIELDS } from "@/lib/live-data";
import { EDITS_TAG, deleteEdit, deleteItemImage, getEdit, saveEdit, uploadItemImage } from "@/lib/item-edits";
import { RARITY_OPTIONS, parseQtyList, slugifyId, type EditorValues } from "@/lib/item-form";
import { updateRequest } from "@/lib/requests-store";
import type { Item, Rarity } from "@/lib/types";

export interface EditorState {
  errors?: Partial<Record<keyof EditorValues | "imageFile", string>>;
  message?: string;
  values?: EditorValues;
}

const s = (form: FormData, k: string) => {
  const v = form.get(k);
  return typeof v === "string" ? v.replace(/\r\n/g, "\n").trim() : "";
};
const isUploaded = (url?: string) => !!url && (url.includes("/storage/v1/object/public/") || url.startsWith("/local-uploads/"));

/** Publishes changes: drops the cached edits and regenerates pages on their next visit. */
function publish() {
  revalidateTag(EDITS_TAG);
  revalidatePath("/", "layout");
}

export async function saveItem(_prev: EditorState, form: FormData): Promise<EditorState> {
  await requireAdmin();
  const mode = s(form, "mode") === "new" ? "new" : "edit";
  const live = await getData();
  const values = Object.fromEntries(
    ["id", "name", "description", "type", "rarity", "value", "weightKg", "stackSize", "foundIn", "recipe", "recyclesInto", "salvagesInto", "tip", "image", "hidden"].map((k) => [k, s(form, k)]),
  ) as unknown as EditorValues;
  const errors: EditorState["errors"] = {};

  // ----- identity -----
  let id = values.id;
  const base = mode === "edit" ? baseData.getItem(id) : undefined;
  const existing = mode === "edit" ? await getEdit(id) : undefined;
  if (mode === "new") {
    id = slugifyId(values.id || values.name);
    values.id = id;
    if (!id) errors.id = "Give the item a name (the id is created from it).";
    else if (live.getItem(id) || baseData.getItem(id)) errors.id = `An item with id “${id}” already exists.`;
  } else if (!base && !existing?.isNew) {
    return { message: "This item no longer exists." };
  }

  // ----- fields -----
  if (!values.name) errors.name = "Name is required.";
  if (!values.type) errors.type = "Type is required.";
  if (!RARITY_OPTIONS.includes(values.rarity as Rarity)) errors.rarity = "Choose a rarity.";
  const num = (k: "value" | "weightKg" | "stackSize", int: boolean, min: number) => {
    if (!values[k]) return undefined;
    const n = Number(values[k].replace(",", "."));
    if (!Number.isFinite(n) || n < min || (int && !Number.isInteger(n))) {
      errors[k] = int ? `Enter a whole number${min ? ` of at least ${min}` : ""}.` : "Enter a number (e.g. 0.25).";
      return undefined;
    }
    return n;
  };
  const value = num("value", true, 0);
  const weightKg = num("weightKg", false, 0);
  const stackSize = num("stackSize", true, 1);
  const exists = (x: string) => Boolean(live.getItem(x) || x === id);
  const lists: Partial<Record<"recipe" | "recyclesInto" | "salvagesInto", Item["recipe"]>> = {};
  for (const k of ["recipe", "recyclesInto", "salvagesInto"] as const) {
    const r = parseQtyList(values[k], exists);
    if (r.error) errors[k] = r.error;
    else lists[k] = r.list?.length ? r.list : undefined;
  }

  // ----- image -----
  let image = values.image || undefined;
  const file = form.get("imageFile");
  const removeImage = form.get("removeImage") === "1";
  if (removeImage) image = undefined;
  if (!Object.keys(errors).length && file instanceof File && file.size > 0) {
    try {
      image = await uploadItemImage(file, id);
    } catch (e) {
      errors.imageFile = e instanceof Error ? e.message : "Upload failed.";
    }
  }

  if (Object.keys(errors).length) return { errors, values, message: "Please fix the highlighted fields." };

  const candidate: Partial<Item> = {
    name: values.name,
    description: values.description || undefined,
    type: values.type,
    rarity: values.rarity as Rarity,
    value: value ?? 0,
    weightKg,
    stackSize,
    foundIn: values.foundIn ? values.foundIn.split(",").map((x) => x.trim()).filter(Boolean) : undefined,
    ...lists,
    tip: values.tip || undefined,
    image,
    hidden: form.get("hidden") === "1" || undefined,
  };

  let data: Partial<Item>;
  const isNew = mode === "new" || !!existing?.isNew;
  if (isNew) {
    data = candidate;
  } else {
    // store only what differs from the dataset; "" marks a removed image
    data = {};
    for (const k of EDITABLE_FIELDS) {
      const next = candidate[k];
      const prev = base?.[k];
      if (JSON.stringify(next ?? null) !== JSON.stringify(prev ?? null)) (data as Record<string, unknown>)[k] = next ?? (k === "image" ? "" : null);
    }
    for (const k of Object.keys(data) as (keyof Item)[]) if (data[k] === null) delete data[k];
  }

  const oldImage = existing?.data.image;
  const note = s(form, "note") || undefined;
  try {
    if (!isNew && !Object.keys(data).length) await deleteEdit(id);
    else await saveEdit({ itemId: id, isNew, data, note });
    if (isUploaded(oldImage) && oldImage !== image) await deleteItemImage(oldImage);
    const requestId = s(form, "requestId");
    if (requestId) await updateRequest(requestId, { status: "done", note: `Applied to ${id}` });
  } catch (e) {
    console.error(e);
    return { values, message: e instanceof Error ? e.message : "Saving failed." };
  }

  publish();
  redirect(`/admin/items/${id}?saved=1`);
}

export async function resetItem(form: FormData) {
  await requireAdmin();
  const id = s(form, "id");
  const edit = await getEdit(id);
  if (edit) {
    await deleteEdit(id);
    if (isUploaded(edit.data.image)) await deleteItemImage(edit.data.image);
  }
  publish();
  redirect(edit?.isNew ? "/admin/items?removed=1" : `/admin/items/${id}?reset=1`);
}
