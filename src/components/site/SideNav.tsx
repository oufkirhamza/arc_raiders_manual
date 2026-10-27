"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV } from "../nav";
import { NavIcon } from "../icons";
import { cx } from "../primitives";

function isActive(pathname: string, href: string) {
  const base = href.split("?")[0];
  return base === "/" ? pathname === "/" : pathname === base || pathname.startsWith(base + "/");
}

export function SideNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Main" className="flex flex-col gap-6 text-sm">
      {NAV.map((g) => (
        <div key={g.group}>
          <p className="eyebrow mb-2 px-3">{g.group}</p>
          <ul className="space-y-0.5">
            {g.items.map((it) => {
              // children that deep-link into another section (with a query) must not light up this parent
              const childActive = it.children?.some((c) => !c.href.includes("?") && isActive(pathname, c.href));
              const active = isActive(pathname, it.href) || childActive;
              return (
                <li key={it.href}>
                  <Link
                    href={it.href}
                    onClick={onNavigate}
                    aria-current={pathname === it.href ? "page" : undefined}
                    className={cx(
                      "relative flex items-center gap-2.5 rounded px-3 py-2 transition-colors",
                      active ? "bg-panel-2 text-ink" : "text-ink-2 hover:bg-panel hover:text-ink",
                    )}
                  >
                    {active && <span className="absolute inset-y-1 left-0 w-0.5 bg-accent" aria-hidden="true" />}
                    <NavIcon name={it.icon} className={cx("h-4 w-4", active ? "text-accent" : "text-muted")} />
                    {it.label}
                  </Link>
                  {it.children && active && (
                    <ul className="ml-9 mt-0.5 space-y-0.5 border-l border-line pl-2">
                      {it.children.map((c) => {
                        const cActive = pathname === c.href.split("?")[0] && !c.href.includes("?");
                        return (
                          <li key={c.href}>
                            <Link
                              href={c.href}
                              onClick={onNavigate}
                              aria-current={cActive ? "page" : undefined}
                              className={cx("block rounded px-2 py-1 text-[0.85rem]", cActive ? "text-accent" : "text-muted hover:text-ink")}
                            >
                              {c.label}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
