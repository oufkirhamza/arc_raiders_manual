/**
 * Compares every number transcribed from the v3.4 cheat sheet with the imported dataset.
 * Runs at build time; results power the /sources page and per-entity conflict notes.
 */
import { pdfDonors, pdfExpeditions, pdfKeepForQuests, pdfKeysByMap, pdfValues, pdfWorkshop } from "@/content/pdf";
import { baseData, getStation, projects } from "./data";

const { getItem, recycleRoi } = baseData;

export interface CheckResult {
  area: "Expedition" | "Workshop" | "Value" | "Donor" | "Reference";
  subject: string;
  href?: string;
  field: string;
  pdf: string;
  dataset: string;
  status: "match" | "conflict" | "missing";
}

const n = (v: number | undefined) => (v == null ? "—" : v.toLocaleString("en-US"));
const itemLabel = (id: string) => getItem(id)?.name ?? id;
const itemHref = (id: string) => (getItem(id) ? `/items/${getItem(id)!.slug}` : undefined);

function compute(): CheckResult[] {
  const out: CheckResult[] = [];

  for (const exp of pdfExpeditions) {
    const proj = projects.find((p) => p.id === exp.projectId);
    const href = proj ? `/projects/${proj.slug}` : undefined;
    for (const ph of exp.phases) {
      const dPhase = proj?.phases.find((p) => p.phase === ph.phase);
      const dItems = new Map((dPhase?.items ?? []).map((i) => [i.id, i.qty]));
      for (const it of ph.items) {
        const d = dItems.get(it.id);
        out.push({
          area: "Expedition", subject: `${exp.label} · Phase ${ph.phase}`, href,
          field: itemLabel(it.id), pdf: `×${it.qty}`, dataset: d == null ? "not listed" : `×${d}`,
          status: d == null ? "conflict" : d === it.qty ? "match" : "conflict",
        });
        dItems.delete(it.id);
      }
      for (const [id, q] of dItems)
        out.push({ area: "Expedition", subject: `${exp.label} · Phase ${ph.phase}`, href, field: itemLabel(id), pdf: "not listed", dataset: `×${q}`, status: "conflict" });
    }
    const load = proj?.phases.find((p) => p.phase === 5)?.categories ?? [];
    for (const [cat, val] of Object.entries(exp.loadStage)) {
      const d = load.find((c) => c.category.toLowerCase() === cat.toLowerCase())?.valueRequired;
      out.push({ area: "Expedition", subject: `${exp.label} · Load Stage`, href, field: cat, pdf: n(val), dataset: n(d), status: d === val ? "match" : "conflict" });
    }
  }

  for (const st of pdfWorkshop) {
    const station = getStation(st.stationId);
    for (const lv of st.levels) {
      const dReq = new Map((station?.levels.find((l) => l.level === lv.level)?.requirements ?? []).map((r) => [r.id, r.qty]));
      for (const it of lv.items) {
        const d = dReq.get(it.id);
        out.push({
          area: "Workshop", subject: `${station?.name ?? st.stationId} · Level ${lv.level}`, href: "/workshop",
          field: itemLabel(it.id), pdf: `×${it.qty}`, dataset: d == null ? "not listed" : `×${d}`,
          status: d === it.qty ? "match" : "conflict",
        });
      }
    }
  }

  for (const [id, v] of Object.entries(pdfValues)) {
    const it = getItem(id);
    if (!it) {
      out.push({ area: "Value", subject: id, field: "item", pdf: "listed", dataset: "not found", status: "missing" });
      continue;
    }
    const roi = recycleRoi(it)?.roi;
    out.push({ area: "Value", subject: it.name, href: itemHref(id), field: "Sell value", pdf: n(v.sell), dataset: n(it.value), status: it.value === v.sell ? "match" : "conflict" });
    out.push({ area: "Value", subject: it.name, href: itemHref(id), field: "Recycle ROI", pdf: `${v.roi}%`, dataset: roi == null ? "—" : `${roi}%`, status: roi != null && Math.abs(roi - v.roi) <= 2 ? "match" : "conflict" });
    if (v.stack != null)
      out.push({ area: "Value", subject: it.name, href: itemHref(id), field: "Stack size", pdf: n(v.stack), dataset: n(it.stackSize), status: it.stackSize === v.stack ? "match" : "conflict" });
  }

  for (const c of pdfDonors) {
    for (const d of c.donors) {
      const it = getItem(d.id);
      const y = it?.recyclesInto?.find((r) => r.id === c.componentId)?.qty;
      out.push({
        area: "Donor", subject: `${itemLabel(d.id)} → ${itemLabel(c.componentId)}`, href: itemHref(d.id),
        field: "Recycle yield", pdf: `+${d.yield}`, dataset: !it ? "item not found" : y == null ? "not a recycle output" : `+${y}`,
        status: !it ? "missing" : y === d.yield ? "match" : "conflict",
      });
    }
  }

  const refs = [...pdfKeepForQuests.map((q) => q.id), ...pdfKeysByMap.flatMap((m) => m.keys)];
  for (const id of refs)
    if (!getItem(id)) out.push({ area: "Reference", subject: id, field: "item id", pdf: "listed", dataset: "not found", status: "missing" });

  return out;
}

export const crosscheck = compute();
export const conflicts = crosscheck.filter((c) => c.status !== "match");
export const conflictsFor = (href: string) => conflicts.filter((c) => c.href === href);
export const crosscheckSummary = {
  total: crosscheck.length,
  match: crosscheck.filter((c) => c.status === "match").length,
  conflict: crosscheck.filter((c) => c.status === "conflict").length,
  missing: crosscheck.filter((c) => c.status === "missing").length,
};
