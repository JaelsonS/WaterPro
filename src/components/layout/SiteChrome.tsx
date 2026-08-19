"use client";

import { usePathname } from "@/i18n/routing";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { isDashboardPath } from "@/lib/dashboard/paths";

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboard = isDashboardPath(pathname);

  if (isDashboard) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      <main id="main-content">{children}</main>
      <Footer />
    </>
  );
}
