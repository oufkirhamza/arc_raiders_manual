"use client";

import { useActionState, useState } from "react";
import { Save, Upload } from "lucide-react";
import { saveItem, type EditorState } from "@/app/admin/items/actions";
import { RARITY_OPTIONS, type EditorValues } from "@/lib/item-form";
import { ItemImage, cx } from "../primitives";
import type { Rarity } from "@/lib/types";

const input = "w-full rounded border border-line bg-bg-2 px-3 py-2 text-sm text-ink placeholder:text-muted focus:border-accent/60 focus:outline-none aria-[invalid=true]:border-bad";


type Ctx = { e: NonNullable<EditorState["errors"]>; base?: EditorValues; v: EditorValues; highlight?: keyof EditorValues };
interface FieldProps { name: keyof EditorValues | "imageFile"; label: string; hint?: string; children: React.ReactNode; wide?: boolean; ctx: Ctx }

function Field({ name, label, hint, children, wide, ctx: { e, base, v, highlight } }: FieldProps) {
  const key = name as keyof EditorValues;
  const changed = base && name in base && base[key] !== v[key];
  return (
    <div className={cx(wide && "md:col-span-2", highlight === name && "rounded-md ring-2 ring-accent/60 ring-offset-4 ring-offset-panel")}>
      <label htmlFor={`f-${name}`} className="mb-1 flex items-center justify-between gap-2 text-sm font-medium text-ink">
        {label}
        {changed && <span className="font-mono text-[0.6rem] uppercase text-accent">changed</span>}
      </label>
      {children}
      {e[name] ? <p className="mt-1 text-xs text-bad" role="alert">{e[name]}</p> : hint ? <p className="mt-1 text-xs text-muted">{hint}</p> : null}
      {changed && base && <p className="mt-1 text-xs text-muted">Dataset: <span className="whitespace-pre-wrap text-ink-2">{base[key] || "—"}</span></p>}
    </div>
  );
}

export function ItemEditorForm({
  mode, initial, base, types, requestId, highlight, isDatasetItem,
}: {
  mode: "new" | "edit";
  initial: EditorValues;
  /** dataset values, shown next to fields that differ */
  base?: EditorValues;
  types: string[];
  requestId?: string;
  highlight?: keyof EditorValues;
  isDatasetItem: boolean;
}) {
  const [state, action, pending] = useActionState<EditorState, FormData>(saveItem, {});
  const v = state.values ?? initial;
  const e = state.errors ?? {};
  const [preview, setPreview] = useState<string | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  // remount uncontrolled inputs when the server echoes values back
  const k = state.values ? JSON.stringify(state.values).length : 0;

  const ctx: Ctx = { e, base, v, highlight };
  const aria = (name: string) => ({ "aria-invalid": e[name as keyof typeof e] ? true : undefined, id: `f-${name}`, name });

  return (
    <form action={action} key={k} className="space-y-6">
      <input type="hidden" name="mode" value={mode} />
      {mode === "edit" && <input type="hidden" name="id" value={v.id} />}
      {requestId && <input type="hidden" name="requestId" value={requestId} />}
      <input type="hidden" name="image" value={removeImage ? "" : v.image} />
      {state.message && <p className="rounded border border-bad/50 bg-bad/10 px-3 py-2 text-sm" role="alert">{state.message}</p>}

      <section className="panel grid gap-4 p-4 md:grid-cols-2">
        <h2 className="eyebrow md:col-span-2">Basics</h2>
        <Field ctx={ctx} name="name" label="Name *"><input {...aria("name")} defaultValue={v.name} maxLength={80} className={input} /></Field>
        {mode === "new" ? (
          <Field ctx={ctx} name="id" label="Id" hint="Optional. Lowercase with underscores; generated from the name if empty. Cannot be changed later.">
            <input {...aria("id")} defaultValue={v.id} maxLength={60} pattern="[a-z0-9_]*" className={cx(input, "font-mono")} />
          </Field>
        ) : (
          <div><p className="mb-1 text-sm font-medium">Id</p><p className="rounded border border-line bg-bg px-3 py-2 font-mono text-sm text-muted">{v.id}</p></div>
        )}
        <Field ctx={ctx} name="type" label="Type *" hint="Pick an existing type or type a new one.">
          <input {...aria("type")} list="type-options" defaultValue={v.type} maxLength={40} className={input} />
          <datalist id="type-options">{types.map((t) => <option key={t} value={t} />)}</datalist>
        </Field>
        <Field ctx={ctx} name="rarity" label="Rarity *">
          <select {...aria("rarity")} defaultValue={v.rarity} className={input}>
            <option value="" disabled>Choose…</option>
            {RARITY_OPTIONS.map((r) => <option key={r}>{r}</option>)}
          </select>
        </Field>
        <Field ctx={ctx} name="description" label="Description" wide><textarea {...aria("description")} defaultValue={v.description} rows={3} maxLength={1000} className={input} /></Field>
      </section>

      <section className="panel grid gap-4 p-4 md:grid-cols-3">
        <h2 className="eyebrow md:col-span-3">Numbers</h2>
        <Field ctx={ctx} name="value" label="Sell value (coins)"><input {...aria("value")} inputMode="numeric" defaultValue={v.value} className={input} /></Field>
        <Field ctx={ctx} name="weightKg" label="Weight (kg)"><input {...aria("weightKg")} inputMode="decimal" defaultValue={v.weightKg} className={input} /></Field>
        <Field ctx={ctx} name="stackSize" label="Stack size"><input {...aria("stackSize")} inputMode="numeric" defaultValue={v.stackSize} className={input} /></Field>
      </section>

      <section className="panel grid gap-4 p-4 md:grid-cols-3">
        <h2 className="eyebrow md:col-span-3">Crafting & recycling</h2>
        <p className="text-xs text-muted md:col-span-3">One entry per line, using item ids: <code className="text-ink-2">metal_parts x5</code>. Ids are shown on each item’s admin page.</p>
        <Field ctx={ctx} name="recipe" label="Crafting recipe"><textarea {...aria("recipe")} defaultValue={v.recipe} rows={5} className={cx(input, "font-mono")} /></Field>
        <Field ctx={ctx} name="recyclesInto" label="Recycles into"><textarea {...aria("recyclesInto")} defaultValue={v.recyclesInto} rows={5} className={cx(input, "font-mono")} /></Field>
        <Field ctx={ctx} name="salvagesInto" label="Salvages into"><textarea {...aria("salvagesInto")} defaultValue={v.salvagesInto} rows={5} className={cx(input, "font-mono")} /></Field>
      </section>

      <section className="panel grid gap-4 p-4 md:grid-cols-2">
        <h2 className="eyebrow md:col-span-2">Where to find & tips</h2>
        <Field ctx={ctx} name="foundIn" label="Found in" hint="Comma-separated loot areas, e.g. Medical, Commercial"><input {...aria("foundIn")} defaultValue={v.foundIn} className={input} /></Field>
        <Field ctx={ctx} name="tip" label="Tip"><input {...aria("tip")} defaultValue={v.tip} maxLength={300} className={input} /></Field>
      </section>

      <section className="panel flex flex-col gap-4 p-4 sm:flex-row sm:items-start">
        <ItemImage src={preview ?? (removeImage ? undefined : v.image || undefined)} alt="Current image" size={112} rarity={(RARITY_OPTIONS.includes(v.rarity as Rarity) ? v.rarity : undefined) as Rarity | undefined} />
        <div className="flex-1">
          <Field ctx={ctx} name="imageFile" label="Image" hint="PNG, JPEG or WebP, up to 2 MB. Square images with a transparent background look best.">
            <label className="flex w-fit cursor-pointer items-center gap-2 rounded border border-line px-3 py-2 text-sm hover:border-accent/60">
              <Upload className="h-4 w-4" aria-hidden="true" /> Choose image
              <input
                id="f-imageFile"
                name="imageFile"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="sr-only"
                onChange={(ev) => {
                  const f = ev.target.files?.[0];
                  setPreview(f ? URL.createObjectURL(f) : null);
                  if (f) setRemoveImage(false);
                }}
              />
            </label>
          </Field>
          {(v.image || preview) && (
            <label className="mt-3 flex items-center gap-2 text-sm text-ink-2">
              <input type="checkbox" name="removeImage" value="1" checked={removeImage} onChange={(ev) => { setRemoveImage(ev.target.checked); if (ev.target.checked) setPreview(null); }} />
              Remove image
            </label>
          )}
        </div>
      </section>

      <section className="panel space-y-3 p-4">
        {isDatasetItem && (
          <label className="flex items-center gap-2 text-sm text-ink-2">
            <input type="checkbox" name="hidden" value="1" defaultChecked={v.hidden === "1"} /> Hide this item from the site (e.g. removed from the game)
          </label>
        )}
        <div>
          <label htmlFor="f-note" className="mb-1 block text-sm font-medium">Change note <span className="font-normal text-muted">(optional, private)</span></label>
          <input id="f-note" name="note" maxLength={300} placeholder="e.g. Value changed in patch 1.47" className={input} />
        </div>
      </section>

      <div className="sticky bottom-0 -mx-1 flex items-center justify-between gap-3 border-t border-line bg-bg/95 px-1 py-3 backdrop-blur">
        <p className="text-xs text-muted">Saving publishes immediately — affected pages refresh within seconds.</p>
        <button type="submit" disabled={pending} className="inline-flex items-center gap-2 rounded bg-accent px-5 py-2.5 font-medium text-accent-ink hover:brightness-110 disabled:opacity-60">
          <Save className="h-4 w-4" aria-hidden="true" /> {pending ? "Saving…" : requestId ? "Save & mark request done" : "Save & publish"}
        </button>
      </div>
    </form>
  );
}
