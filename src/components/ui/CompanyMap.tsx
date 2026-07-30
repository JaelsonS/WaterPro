"use client";

import { useTranslations } from "next-intl";
import { COMPANY_ADDRESS, COMPANY_ADDRESS_LINE } from "@/lib/config";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/utils";

export function CompanyMap({ className }: { className?: string }) {
  const t = useTranslations("map");

  const embedSrc = `https://maps.google.com/maps?q=${encodeURIComponent(COMPANY_ADDRESS.mapQuery)}&hl=pt&z=15&output=embed`;

  return (
    <Reveal delay={0.15}>
      <div
        className={cn(
          "overflow-hidden rounded-3xl border border-slate-line bg-white shadow-[0_12px_40px_rgba(15,23,42,0.06)]",
          className
        )}
      >
        <div className="border-b border-slate-line px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-azure">
            {t("tag")}
          </p>
          <h3 className="mt-1 font-[family-name:var(--font-display)] text-xl font-light text-ink md:text-2xl">
            {t("title")}
          </h3>
          <p className="mt-1 text-sm text-ink-soft">{COMPANY_ADDRESS_LINE}</p>
          <a
            href={COMPANY_ADDRESS.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex text-sm font-medium text-azure transition-colors hover:text-cyan"
          >
            {t("directions")} →
          </a>
        </div>
        <div className="relative h-[220px] w-full sm:h-[260px] lg:h-[280px]">
          <iframe
            title={t("iframeTitle")}
            src={embedSrc}
            className="absolute inset-0 h-full w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </div>
      </div>
    </Reveal>
  );
}
