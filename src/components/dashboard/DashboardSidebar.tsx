"use client";

import { Link, usePathname } from "@/i18n/routing";
import { DASHBOARD_NAV } from "@/lib/dashboard/paths";
import { cn } from "@/lib/utils";

type DashboardSidebarProps = {
  collapsed?: boolean;
  onNavigate?: () => void;
};

export function DashboardSidebar({ collapsed = false, onNavigate }: DashboardSidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r border-slate-line bg-white",
        collapsed ? "w-16" : "w-64",
      )}
      aria-label="Navegação do painel"
    >
      <div className={cn("border-b border-slate-line px-4 py-5", collapsed && "px-2 text-center")}>
        <Link href="/dashboard" className="inline-flex items-center gap-2" onClick={onNavigate}>
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-azure to-cyan text-sm font-semibold text-white">
            W
          </span>
          {!collapsed ? (
            <span className="font-[family-name:var(--font-display)] text-xl text-ink">
              Water<span className="text-azure">Pro</span>
            </span>
          ) : null}
        </Link>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {DASHBOARD_NAV.map((item) => {
          const active = "exact" in item && item.exact ? pathname === item.href : pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              title={collapsed ? item.label : undefined}
              className={cn(
                "flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-azure/10 text-azure"
                  : "text-ink-soft hover:bg-ice hover:text-ink",
                collapsed && "justify-center px-2",
              )}
            >
              {collapsed ? item.label.slice(0, 1) : item.label}
            </Link>
          );
        })}
      </nav>

      {!collapsed ? (
        <div className="border-t border-slate-line p-4 text-xs text-ink-muted">
          Área da empresa
        </div>
      ) : null}
    </aside>
  );
}
