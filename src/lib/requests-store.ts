import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import { randomBytes } from "node:crypto";
import type { ContributionRequest, NewRequestInput, RequestStatus } from "./requests";

/**
 * File-backed store for contribution requests (a single JSON file).
 * Suitable for a self-hosted `next start` deployment. Writes are serialised through a promise
 * queue and replaced atomically (write temp file, then rename), so a crash never leaves half a file.
 * Swap this module for a database if the site is deployed to a serverless host.
 */
const FILE = path.resolve(process.env.REQUESTS_DB_PATH ?? path.join(process.cwd(), "storage", "requests.json"));

let queue: Promise<unknown> = Promise.resolve();
function serial<T>(fn: () => Promise<T>): Promise<T> {
  const run = queue.then(fn, fn);
  queue = run.catch(() => {});
  return run;
}

async function readAll(): Promise<ContributionRequest[]> {
  try {
    return JSON.parse(await fs.readFile(FILE, "utf8")) as ContributionRequest[];
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw e;
  }
}

async function writeAll(list: ContributionRequest[]) {
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  const tmp = `${FILE}.${process.pid}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(list, null, 2), "utf8");
  await fs.rename(tmp, FILE);
}

const newId = () => `REQ-${Date.now().toString(36).toUpperCase()}-${randomBytes(2).toString("hex").toUpperCase()}`;

export async function listRequests(): Promise<ContributionRequest[]> {
  const list = await readAll();
  return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getRequest(id: string) {
  return (await readAll()).find((r) => r.id === id);
}

export function createRequest(input: NewRequestInput): Promise<ContributionRequest> {
  return serial(async () => {
    const list = await readAll();
    const now = new Date().toISOString();
    const req: ContributionRequest = { ...input, id: newId(), createdAt: now, updatedAt: now, status: "new", history: [{ at: now, status: "new" }] };
    list.push(req);
    await writeAll(list);
    return req;
  });
}

export function updateRequest(id: string, patch: { status?: RequestStatus; adminNotes?: string }) {
  return serial(async () => {
    const list = await readAll();
    const r = list.find((x) => x.id === id);
    if (!r) return undefined;
    const now = new Date().toISOString();
    if (patch.status && patch.status !== r.status) {
      r.status = patch.status;
      r.history.push({ at: now, status: patch.status });
    }
    if (patch.adminNotes !== undefined) r.adminNotes = patch.adminNotes.slice(0, 5000) || undefined;
    r.updatedAt = now;
    await writeAll(list);
    return r;
  });
}

export function deleteRequest(id: string) {
  return serial(async () => {
    const list = await readAll();
    const next = list.filter((r) => r.id !== id);
    if (next.length !== list.length) await writeAll(next);
    return next.length !== list.length;
  });
}

/** Count of recent submissions from one client key — used for simple rate limiting. */
const recent = new Map<string, number[]>();
export function allowSubmission(key: string, max = 5, windowMs = 10 * 60 * 1000) {
  const now = Date.now();
  const hits = (recent.get(key) ?? []).filter((t) => now - t < windowMs);
  if (hits.length >= max) return false;
  hits.push(now);
  recent.set(key, hits);
  return true;
}
