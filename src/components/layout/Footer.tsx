"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { SocialLinks } from "@/components/ui/SocialIcons";
import { buildGeneralWhatsAppUrl } from "@/lib/config";

export function Footer() {
  const t = useTranslations("footer");

  return (
    <footer className="relative border-t border-slate-line bg-ice py-16 water-wave-bg">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-3" aria-label="Water Pro">
              <svg viewBox="0 0 40 40" className="h-8 w-8" aria-hidden="true">
                <defs>
                  <linearGradient id="footerLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#1a7fb8" />
                    <stop offset="100%" stopColor="#4ecdc4" />
                  </linearGradient>
                </defs>
                <path
                  d="M20 4C20 4 8 18 8 26C8 32.627 13.373 38 20 38C26.627 38 32 32.627 32 26C32 18 20 4 20 4Z"
                  fill="url(#footerLogoGrad)"
                  opacity="0.9"
                />
              </svg>
              <span className="font-[family-name:var(--font-display)] text-xl font-light text-ink">
                Water<span className="text-azure">Pro</span>
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-muted">
              {t("tagline")}
            </p>
            <p className="mt-2 text-xs text-ink-muted/70">{t("coverage")}</p>
          </div>

          <div>
            <p className="mb-4 text-sm font-medium text-ink-soft">{t("shop")}</p>
            <nav className="flex flex-col gap-3" aria-label="Shop links">
              <Link href="/para-sua-casa" className="text-sm text-ink-muted transition-colors hover:text-azure">
                {t("home")}
              </Link>
              <Link href="/para-a-sua-empresa" className="text-sm text-ink-muted transition-colors hover:text-azure">
                {t("business")}
              </Link>
              <Link href="/sobre" className="text-sm text-ink-muted transition-colors hover:text-azure">
                {t("about")}
              </Link>
            </nav>
          </div>

          <div>
            <p className="mb-4 text-sm font-medium text-ink-soft">Contacto</p>
            <div className="flex flex-col gap-3 text-sm text-ink-muted">
              <a href={`tel:${t("phone").replace(/\s/g, "")}`} className="hover:text-azure transition-colors">
                {t("phone")}
              </a>
              <a href={`mailto:${t("email")}`} className="hover:text-azure transition-colors">
                {t("email")}
              </a>
              <a
                href={buildGeneralWhatsAppUrl("pt")}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-azure transition-colors"
              >
                WhatsApp
              </a>
              <span className="text-xs text-ink-muted/60">{t("nif")}</span>
            </div>
          </div>

          <div>
            <p className="mb-4 text-sm font-medium text-ink-soft">{t("follow")}</p>
            <SocialLinks />
            <nav className="mt-6 flex flex-col gap-3" aria-label="Footer links">
              <a href="#" className="text-sm text-ink-muted transition-colors hover:text-azure">
                {t("links.privacy")}
              </a>
              <a href="#" className="text-sm text-ink-muted transition-colors hover:text-azure">
                {t("links.terms")}
              </a>
              <a href="#" className="text-sm text-ink-muted transition-colors hover:text-azure">
                {t("links.cookies")}
              </a>
            </nav>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-line pt-8 sm:flex-row">
          <p className="text-xs text-ink-muted/70">
            &copy; {new Date().getFullYear()} Water Pro. {t("rights")}
          </p>
          <p className="text-xs text-ink-muted/50">
            {t("developedBy")}{" "}
            <a
              href="https://www.afdigitalweb.com"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-azure"
            >
              {t("afdigital")}
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
