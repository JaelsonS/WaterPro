export const DASHBOARD_NAV = [
  { href: "/dashboard", label: "Dashboard", exact: true },
  { href: "/dashboard/whatsapp", label: "WhatsApp" },
  { href: "/dashboard/vendedores", label: "Vendedores" },
  { href: "/dashboard/definicoes", label: "Definições" },
] as const;

export function isDashboardPath(pathname: string | null): boolean {
  if (!pathname) return false;
  return pathname === "/dashboard" || pathname.startsWith("/dashboard/") || pathname === "/cadastro";
}
