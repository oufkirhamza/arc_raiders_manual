import Link from "next/link";
import { LogOut } from "lucide-react";
import { logout } from "@/app/admin/actions";

export function AdminBar() {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded border border-accent/40 bg-accent/5 px-4 py-2 text-sm">
      <div className="flex items-center gap-4">
        <span className="font-mono text-xs uppercase tracking-widest text-accent">Back office</span>
        <Link href="/admin" className="text-ink hover:text-accent">Requests</Link>
        <a href="/admin/export?format=csv" className="text-ink-2 hover:text-accent">Export CSV</a>
        <a href="/admin/export?format=json" className="text-ink-2 hover:text-accent">Export JSON</a>
      </div>
      <form action={logout}>
        <button type="submit" className="inline-flex items-center gap-1.5 text-ink-2 hover:text-accent">
          <LogOut className="h-4 w-4" aria-hidden="true" /> Sign out
        </button>
      </form>
    </div>
  );
}

const STATUS_STYLE: Record<string, string> = {
  new: "border-accent/60 text-accent",
  in_review: "border-info/60 text-info",
  accepted: "border-r-epic/60 text-r-epic",
  done: "border-ok/60 text-ok",
  rejected: "border-line-2 text-muted",
};
export function StatusBadge({ status, label }: { status: string; label: string }) {
  return <span className={`inline-block rounded border px-1.5 py-0.5 font-mono text-[0.65rem] uppercase tracking-wider ${STATUS_STYLE[status] ?? ""}`}>{label}</span>;
}
