import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ExternalLink, RotateCcw } from "lucide-react";
import { AdminBar } from "@/components/admin/AdminBar";
import { ItemEditorForm } from "@/components/admin/ItemEditorForm";
import { baseData } from "@/lib/data";
import { getEdit } from "@/lib/item-edits";
import { itemToValues, REQUEST_FIELD_MAP, type EditorValues } from "@/lib/item-form";
import { getRequest } from "@/lib/requests-store";
import { REQUEST_KINDS } from "@/lib/requests";
import type { Item } from "@/lib/types";
import { resetItem } from "../actions";

export const metadata: Metadata = { title: "Edit item · Back office", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminItemPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ request?: string; saved?: string; reset?: string }> }) {
  const { id } = await params;
  const sp = await searchParams;
  const isNewForm = id === "new";
  const base = isNewForm ? undefined : baseData.getItem(id);
  const edit = isNewForm ? undefined : await getEdit(id);
  if (!isNewForm && !base && !edit?.isNew) notFound();

  const current: Partial<Item> | undefined = base ? { ...base, ...edit?.data } : edit?.data && { ...edit.data, id };
  const initial: EditorValues = itemToValues(current);
  if (current?.image === "") initial.image = "";
  const request = sp.request ? await getRequest(sp.request) : undefined;

  // prefill from a request
  let highlight: keyof EditorValues | undefined;
  if (request) {
    if (request.kind === "new_item" && isNewForm) {
      initial.name = request.itemName ?? "";
      initial.description = request.details;
    }
    const field = request.field ? REQUEST_FIELD_MAP[request.field] : undefined;
    if (field && request.proposedValue) {
      highlight = field;
      const numeric = field === "value" || field === "weightKg" || field === "stackSize";
      const n = request.proposedValue.replace(/[^\d.,]/g, "").replace(",", ".");
      if (numeric ? n && Number.isFinite(Number(n)) : !["recipe", "recyclesInto", "salvagesInto", "image"].includes(field)) {
        initial[field] = numeric ? n : request.proposedValue;
      }
    }
  }
  const types = [...new Set(baseData.ITEM_TYPES)];
  const publicSlug = (current?.slug ?? id.replace(/_/g, "-"));

  return (
    <>
      <AdminBar />
      <nav aria-label="Breadcrumb" className="mb-4 text-sm text-muted"><Link href="/admin/items" className="hover:text-ink">Items</Link> / <span className="text-ink-2">{isNewForm ? "New item" : current?.name}</span></nav>

      {sp.saved && <p className="mb-4 rounded border border-ok/40 bg-ok/10 px-3 py-2 text-sm" role="status">Saved and published. Pages update on their next visit.</p>}
      {sp.reset && <p className="mb-4 rounded border border-ok/40 bg-ok/10 px-3 py-2 text-sm" role="status">Reverted to the dataset version.</p>}

      <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="eyebrow mb-1">{isNewForm ? "Add an item that is missing from the dataset" : edit?.isNew ? "Item added by you" : edit ? "Dataset item · edited" : "Dataset item"}</p>
          <h1 className="font-display text-4xl font-bold uppercase tracking-wide">{isNewForm ? "New item" : current?.name}</h1>
          {edit && <p className="mt-1 text-sm text-muted">Last saved {edit.updatedAt.slice(0, 16).replace("T", " ")} UTC{edit.note ? ` — “${edit.note}”` : ""}</p>}
        </div>
        <div className="flex flex-wrap gap-2">
          {!isNewForm && (
            <Link href={`/items/${publicSlug}`} target="_blank" className="inline-flex items-center gap-1.5 rounded border border-line px-3 py-1.5 text-sm hover:border-accent/60">
              View on site <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          )}
          {edit && (
            <form action={resetItem}>
              <input type="hidden" name="id" value={id} />
              <button type="submit" className="inline-flex items-center gap-1.5 rounded border border-bad/50 px-3 py-1.5 text-sm text-bad hover:bg-bad/10">
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" /> {edit.isNew ? "Delete this item" : "Revert to dataset"}
              </button>
            </form>
          )}
        </div>
      </header>

      {request && (
        <aside className="panel mb-6 border-l-4 border-l-accent p-4 text-sm">
          <p className="eyebrow mb-1">Applying request <Link className="link normal-case" href={`/admin/requests/${request.id}`}>{request.id}</Link> · {REQUEST_KINDS[request.kind]}</p>
          {request.field && <p className="text-ink-2"><strong className="text-ink">{request.field}:</strong> {request.currentValue ? <>“{request.currentValue}” → </> : null}<strong className="text-accent">{request.proposedValue}</strong></p>}
          <p className="mt-1 whitespace-pre-wrap text-ink-2">{request.details}</p>
          {request.sourceUrl && <p className="mt-1"><a className="link break-all" href={request.sourceUrl} target="_blank" rel="noopener noreferrer nofollow">{request.sourceUrl}</a></p>}
          <p className="mt-2 text-xs text-muted">{highlight ? "The highlighted field was pre-filled from the request — check it before saving." : "Make the change below."} Saving marks the request as Done.</p>
        </aside>
      )}

      <ItemEditorForm
        mode={isNewForm ? "new" : "edit"}
        initial={initial}
        base={base ? itemToValues(base) : undefined}
        types={types}
        requestId={request?.id}
        highlight={highlight}
        isDatasetItem={!!base}
      />
    </>
  );
}
