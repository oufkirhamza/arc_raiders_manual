import { cookies } from "next/headers";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/admin-auth";
import { listRequests } from "@/lib/requests-store";
import { getData } from "@/lib/live-data";

export const dynamic = "force-dynamic";

const csvCell = (v: unknown) => {
  let s = v == null ? "" : String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`; // neutralise spreadsheet formula injection
  return `"${s.replace(/"/g, '""')}"`;
};

export async function GET(req: Request) {
  if (!(await verifySessionToken((await cookies()).get(SESSION_COOKIE)?.value))) return new Response("Unauthorized", { status: 401 });
  const list = await listRequests();
  const { getItem } = await getData();
  const format = new URL(req.url).searchParams.get("format");
  const stamp = new Date().toISOString().slice(0, 10);

  if (format === "csv") {
    const cols = ["id", "createdAt", "status", "kind", "itemId", "itemName", "field", "currentValue", "proposedValue", "details", "sourceUrl", "contact", "adminNotes"] as const;
    const rows = list.map((r) => cols.map((c) => csvCell(c === "itemName" ? r.itemName ?? (r.itemId ? getItem(r.itemId)?.name : "") : r[c])).join(","));
    return new Response([cols.join(","), ...rows].join("\r\n"), {
      headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="requests-${stamp}.csv"` },
    });
  }
  return new Response(JSON.stringify(list, null, 2), {
    headers: { "Content-Type": "application/json", "Content-Disposition": `attachment; filename="requests-${stamp}.json"` },
  });
}
