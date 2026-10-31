import "server-only";
import { randomBytes } from "node:crypto";
import type { ContributionRequest, NewRequestInput, RequestStatus } from "./requests";
import { assertOk, supabase } from "./supabase";
import { localJson } from "./local-store";

/**
 * Contribution requests. Stored in the Supabase `requests` table when Supabase is configured,
 * otherwise in storage/requests.json (local development only — not persistent on Vercel).
 */
const local = localJson<ContributionRequest[]>("requests.json", []);

type Row = {
  id: string; created_at: string; updated_at: string; kind: ContributionRequest["kind"]; status: RequestStatus;
  item_id: string | null; item_name: string | null; field: string | null; current_value: string | null; proposed_value: string | null;
  details: string; source_url: string | null; contact: string | null; admin_notes: string | null; history: ContributionRequest["history"];
};
const n = <T,>(v: T | null) => v ?? undefined;
const fromRow = (r: Row): ContributionRequest => ({
  id: r.id, createdAt: r.created_at, updatedAt: r.updated_at, kind: r.kind, status: r.status,
  itemId: n(r.item_id), itemName: n(r.item_name), field: n(r.field), currentValue: n(r.current_value), proposedValue: n(r.proposed_value),
  details: r.details, sourceUrl: n(r.source_url), contact: n(r.contact), adminNotes: n(r.admin_notes), history: r.history ?? [],
});
const toRow = (r: ContributionRequest): Row => ({
  id: r.id, created_at: r.createdAt, updated_at: r.updatedAt, kind: r.kind, status: r.status,
  item_id: r.itemId ?? null, item_name: r.itemName ?? null, field: r.field ?? null, current_value: r.currentValue ?? null,
  proposed_value: r.proposedValue ?? null, details: r.details, source_url: r.sourceUrl ?? null, contact: r.contact ?? null,
  admin_notes: r.adminNotes ?? null, history: r.history,
});

const newId = () => `REQ-${Date.now().toString(36).toUpperCase()}-${randomBytes(2).toString("hex").toUpperCase()}`;

export async function listRequests(): Promise<ContributionRequest[]> {
  const db = supabase();
  if (db) return (assertOk(await db.from("requests").select("*").order("created_at", { ascending: false }), "list requests") ?? []).map((r) => fromRow(r as Row));
  return (await local.read()).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getRequest(id: string) {
  const db = supabase();
  if (db) {
    const row = assertOk(await db.from("requests").select("*").eq("id", id).maybeSingle(), "get request");
    return row ? fromRow(row as Row) : undefined;
  }
  return (await local.read()).find((r) => r.id === id);
}

export async function createRequest(input: NewRequestInput): Promise<ContributionRequest> {
  const now = new Date().toISOString();
  const req: ContributionRequest = { ...input, id: newId(), createdAt: now, updatedAt: now, status: "new", history: [{ at: now, status: "new" }] };
  const db = supabase();
  if (db) {
    assertOk(await db.from("requests").insert(toRow(req)), "create request");
    return req;
  }
  await local.update((list) => [...list, req]);
  return req;
}

function applyPatch(r: ContributionRequest, patch: { status?: RequestStatus; adminNotes?: string; note?: string }) {
  const now = new Date().toISOString();
  if (patch.status && patch.status !== r.status) {
    r.status = patch.status;
    r.history = [...r.history, { at: now, status: patch.status, ...(patch.note ? { note: patch.note } : {}) }];
  }
  if (patch.adminNotes !== undefined) r.adminNotes = patch.adminNotes.slice(0, 5000) || undefined;
  r.updatedAt = now;
  return r;
}

export async function updateRequest(id: string, patch: { status?: RequestStatus; adminNotes?: string; note?: string }) {
  const db = supabase();
  if (db) {
    const current = await getRequest(id);
    if (!current) return undefined;
    const r = applyPatch(current, patch);
    assertOk(await db.from("requests").update({ status: r.status, history: r.history, admin_notes: r.adminNotes ?? null, updated_at: r.updatedAt }).eq("id", id), "update request");
    return r;
  }
  let out: ContributionRequest | undefined;
  await local.update((list) => {
    const r = list.find((x) => x.id === id);
    if (r) out = applyPatch(r, patch);
    return list;
  });
  return out;
}

export async function deleteRequest(id: string) {
  const db = supabase();
  if (db) {
    assertOk(await db.from("requests").delete().eq("id", id), "delete request");
    return true;
  }
  let removed = false;
  await local.update((list) => {
    const next = list.filter((r) => r.id !== id);
    removed = next.length !== list.length;
    return next;
  });
  return removed;
}

/**
 * Best-effort rate limit per client key. On serverless hosts each instance keeps its own memory,
 * so this slows down floods rather than guaranteeing a hard limit.
 */
const recent = new Map<string, number[]>();
export function allowSubmission(key: string, max = 5, windowMs = 10 * 60 * 1000) {
  const now = Date.now();
  const hits = (recent.get(key) ?? []).filter((t) => now - t < windowMs);
  if (hits.length >= max) return false;
  hits.push(now);
  recent.set(key, hits);
  return true;
}
