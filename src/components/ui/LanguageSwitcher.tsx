"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/routing";
import { locales, localeNames, type Locale } from "@/i18n/config";
import { cn } from "@/lib/utils";

const localeLabels: Record<Locale, { short: string; name: string }> = {
  pt: { short: "PT", name: "Português" },
  en: { short: "EN", name: "English" },
};

export function LanguageSwitcher({
  className,
  variant = "default",
}: {
  className?: string;
  variant?: "default" | "light";
}) {
  const t = useTranslations("a11y");
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex items-center gap-2 rounded-full border px-3 py-2 text-sm transition-all",
          variant === "light"
            ? "border-ink/15 bg-white/60 text-ink/80 backdrop-blur-sm hover:border-azure/40 hover:text-azure"
            : "border-slate-line bg-white text-ink-muted hover:border-azure/30 hover:text-azure"
        )}
        aria-label={t("languageSwitch")}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .838-.112 1.627-.322 2.378M6.343 6.343A8.959 8.959 0 003 12c0 .838.112 1.627.322 2.378"
          />
        </svg>
        <span>{localeLabels[locale].short}</span>
        <svg
          className={cn("h-3 w-3 transition-transform", open && "rotate-180")}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {open && (
        <div
          role="listbox"
          aria-label={t("languageSwitch")}
          className="absolute right-0 top-full z-50 mt-2 min-w-[160px] overflow-hidden rounded-xl border border-slate-line bg-white py-1 shadow-xl"
        >
          {locales.map((loc) => (
            <Link
              key={loc}
              href={pathname}
              locale={loc}
              role="option"
              aria-selected={locale === loc}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center justify-between px-4 py-2.5 text-sm transition-colors hover:bg-sky/50",
                locale === loc ? "text-azure" : "text-ink-muted"
              )}
            >
              <span>{localeLabels[loc].name}</span>
              <span className="text-xs opacity-50">{localeNames[loc]}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
