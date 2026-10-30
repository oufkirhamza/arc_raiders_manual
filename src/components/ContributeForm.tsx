"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { CheckCircle2, Send } from "lucide-react";
import { submitRequest, type SubmitState } from "@/app/contribute/actions";
import { CORRECTION_FIELDS, REQUEST_KINDS, type RequestKind } from "@/lib/requests";
import { cx } from "./primitives";

export interface ItemOption { id: string; name: string; slug: string }

const field = "w-full rounded border border-line bg-bg-2 px-3 py-2 text-sm text-ink placeholder:text-muted focus:border-accent/60 focus:outline-none aria-[invalid=true]:border-bad";

function Field({ id, label, hint, error, required, children }: { id: string; label: string; hint?: string; error?: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-ink">
        {label} {required ? <span className="text-accent" aria-hidden="true">*</span> : <span className="font-normal text-muted">(optional)</span>}
      </label>
      {children}
      {hint && !error && <p id={`${id}-hint`} className="mt-1 text-xs text-muted">{hint}</p>}
      {error && <p id={`${id}-error`} className="mt-1 text-xs text-bad" role="alert">{error}</p>}
    </div>
  );
}

export function ContributeForm({ items, initialKind, initialItem }: { items: ItemOption[]; initialKind?: RequestKind; initialItem?: ItemOption }) {
  const [state, action, pending] = useActionState<SubmitState, FormData>(submitRequest, {});
  const [kind, setKind] = useState<RequestKind>(initialKind ?? (initialItem ? "correction" : "new_item"));
  const [itemQuery, setItemQuery] = useState(initialItem?.name ?? "");
  const match = items.find((i) => i.name.toLowerCase() === itemQuery.trim().toLowerCase());
  const e = state.errors ?? {};
  const v = state.values ?? {};
  const aria = (k: keyof typeof e, hint?: boolean) => ({ "aria-invalid": e[k] ? true : undefined, "aria-describedby": e[k] ? `${k}-error` : hint ? `${k}-hint` : undefined });

  if (state.ok) {
    return (
      <div className="panel p-8 text-center" role="status">
        <CheckCircle2 className="mx-auto h-10 w-10 text-ok" aria-hidden="true" />
        <h2 className="mt-3 font-display text-3xl font-bold uppercase tracking-wide">Request received</h2>
        <p className="mt-2 text-ink-2">Thanks! An editor will review it. Your reference is <span className="num text-accent">{state.id}</span>.</p>
        <div className="mt-6 flex justify-center gap-3">
          <a href="/contribute" className="rounded border border-line px-4 py-2 text-sm hover:border-accent/60">Send another</a>
          <Link href="/items" className="rounded bg-accent px-4 py-2 text-sm font-medium text-accent-ink">Back to items</Link>
        </div>
      </div>
    );
  }

  return (
    <form action={action} className="panel space-y-5 p-5" noValidate>
      {state.message && <p className="rounded border border-bad/50 bg-bad/10 px-3 py-2 text-sm text-ink" role="alert">{state.message}</p>}

      <fieldset>
        <legend className="mb-2 text-sm font-medium text-ink">What would you like to do? <span className="text-accent" aria-hidden="true">*</span></legend>
        <div className="grid gap-2 sm:grid-cols-3">
          {(Object.keys(REQUEST_KINDS) as RequestKind[]).map((k) => (
            <label key={k} className={cx("flex cursor-pointer items-center gap-2 rounded border px-3 py-2.5 text-sm transition-colors", kind === k ? "border-accent bg-accent/10 text-ink" : "border-line text-ink-2 hover:border-line-2")}>
              <input type="radio" name="kind" value={k} checked={kind === k} onChange={() => setKind(k)} className="accent-[var(--color-accent)]" />
              {REQUEST_KINDS[k]}
            </label>
          ))}
        </div>
      </fieldset>

      {kind !== "new_item" && (
        <Field id="itemId" label="Item" required={kind === "correction"} error={e.itemId} hint="Start typing and pick the item from the list.">
          <input
            id="itemId"
            list="item-options"
            value={itemQuery}
            onChange={(ev) => setItemQuery(ev.target.value)}
            placeholder="e.g. Durable Cloth"
            autoComplete="off"
            className={field}
            {...aria("itemId", true)}
          />
          <datalist id="item-options">{items.map((i) => <option key={i.id} value={i.name} />)}</datalist>
          <input type="hidden" name="itemId" value={match?.id ?? ""} />
          {match && <p className="mt-1 text-xs text-ok">Selected: <Link className="link" href={`/items/${match.slug}`} target="_blank">{match.name}</Link></p>}
        </Field>
      )}

      {kind === "new_item" && (
        <Field id="itemName" label="Item name" required error={e.itemName} hint="Exactly as it appears in game.">
          <input id="itemName" name="itemName" defaultValue={v.itemName} maxLength={80} className={field} {...aria("itemName", true)} />
        </Field>
      )}

      {kind === "correction" && (
        <div className="grid gap-4 md:grid-cols-3">
          <Field id="field" label="What is wrong?" required error={e.field}>
            <select key={`field-${v.field ?? ""}`} id="field" name="field" defaultValue={v.field ?? ""} className={field} {...aria("field")}>
              <option value="" disabled>Choose…</option>
              {CORRECTION_FIELDS.map((f) => <option key={f}>{f}</option>)}
            </select>
          </Field>
          <Field id="currentValue" label="Shown on the site">
            <input id="currentValue" name="currentValue" defaultValue={v.currentValue} maxLength={300} className={field} />
          </Field>
          <Field id="proposedValue" label="Correct value" required error={e.proposedValue}>
            <input id="proposedValue" name="proposedValue" defaultValue={v.proposedValue} maxLength={500} className={field} {...aria("proposedValue")} />
          </Field>
        </div>
      )}

      <Field id="details" label="Details" required error={e.details} hint={kind === "new_item" ? "Rarity, type, where you found it, what it recycles into, what it's used for — anything you know." : "How did you find this out? Which patch or game version?"}>
        <textarea id="details" name="details" defaultValue={v.details} rows={6} maxLength={3000} className={field} {...aria("details", true)} />
      </Field>

      <div className="grid gap-4 md:grid-cols-2">
        <Field id="sourceUrl" label="Source link" error={e.sourceUrl} hint="Screenshot, video, patch notes or wiki page.">
          <input id="sourceUrl" name="sourceUrl" defaultValue={v.sourceUrl} type="url" inputMode="url" placeholder="https://" maxLength={500} className={field} {...aria("sourceUrl", true)} />
        </Field>
        <Field id="contact" label="Your name or contact" hint="Only if you want credit or a follow-up. Visible to the editor only.">
          <input id="contact" name="contact" defaultValue={v.contact} maxLength={120} autoComplete="nickname" className={field} />
        </Field>
      </div>

      {/* honeypot for bots — hidden from people and assistive tech */}
      <div aria-hidden="true" className="absolute left-[-10000px] h-px w-px overflow-hidden">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="flex flex-col-reverse items-start justify-between gap-3 border-t border-line pt-4 sm:flex-row sm:items-center">
        <p className="text-xs text-muted">Requests are reviewed by hand before anything changes on the site.</p>
        <button type="submit" disabled={pending} className="inline-flex items-center gap-2 rounded bg-accent px-5 py-2.5 font-medium text-accent-ink hover:brightness-110 disabled:opacity-60">
          <Send className="h-4 w-4" aria-hidden="true" /> {pending ? "Sending…" : "Send request"}
        </button>
      </div>
    </form>
  );
}
