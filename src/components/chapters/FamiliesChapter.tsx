"use client";

import { useRef } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { media } from "@/lib/media";
import { SafeImage } from "@/components/ui/SafeImage";
import { Reveal } from "@/components/ui/Reveal";
import { MagneticButton } from "@/components/ui/MagneticButton";

export function FamiliesChapter() {
  const t = useTranslations("families");
  const locale = useLocale() as "pt" | "en";
  const scrollerRef = useRef<HTMLDivElement>(null);

  const scrollBy = (dir: -1 | 1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.querySelector("a");
    const amount = card ? card.clientWidth + 24 : el.clientWidth * 0.7;
    el.scrollBy({ left: dir * amount, behavior: "smooth" });
  };

  return (
    <section
      id="families"
      className="relative overflow-hidden bg-ice py-24 md:py-32"
      aria-labelledby="families-title"
    >
      <div className="absolute inset-0 chapter-glow opacity-60" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
        <Reveal>
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-azure">
            {t("tag")}
          </p>
        </Reveal>
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <Reveal delay={0.1}>
              <h2
                id="families-title"
                className="max-w-3xl font-[family-name:var(--font-display)] text-4xl font-semibold text-ink md:text-6xl"
              >
                {t("title")}
              </h2>
            </Reveal>
            <Reveal delay={0.2}>
              <p className="mt-6 max-w-2xl text-lg text-ink-soft">{t("subtitle")}</p>
            </Reveal>
          </div>
          <Reveal delay={0.25}>
            <div className="flex items-center gap-3">
              <p className="hidden text-sm text-ink-muted sm:block">{t("swipeHint")}</p>
              <button
                type="button"
                onClick={() => scrollBy(-1)}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-line bg-white text-ink shadow-sm transition-colors hover:border-azure hover:text-azure"
                aria-label={t("prev")}
              >
                ←
              </button>
              <button
                type="button"
                onClick={() => scrollBy(1)}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-line bg-white text-ink shadow-sm transition-colors hover:border-azure hover:text-azure"
                aria-label={t("next")}
              >
                →
              </button>
            </div>
          </Reveal>
        </div>
      </div>

      <div className="relative z-10 mt-12">
        <div
          ref={scrollerRef}
          className="flex gap-6 overflow-x-auto px-6 pb-6 snap-x snap-mandatory scroll-smooth lg:px-8 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
          {media.families.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group relative h-[50vh] w-[78vw] shrink-0 snap-center overflow-hidden rounded-3xl border border-slate-line bg-white shadow-[0_8px_32px_rgba(15,23,42,0.06)] transition-all duration-300 hover:border-azure/40 hover:shadow-[0_16px_48px_rgba(26,127,184,0.14)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-azure md:h-[55vh] md:w-[40vw] lg:w-[32vw]"
              aria-label={`${t("viewProduct")}: ${item.caption[locale]}`}
            >
              <SafeImage
                src={item.src}
                alt={item.caption[locale]}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 768px) 78vw, 40vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-white via-white/60 to-white/5" />
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <p className="font-[family-name:var(--font-display)] text-2xl font-semibold text-ink text-on-media md:text-3xl">
                  {item.caption[locale]}
                </p>
                <span className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-azure">
                  {t("viewProduct")} →
                </span>
              </div>
            </Link>
          ))}
        </div>
        <p className="mt-2 px-6 text-center text-sm text-ink-muted sm:hidden lg:px-8">
          {t("swipeHint")}
        </p>

        <div className="mx-auto mt-16 max-w-xl px-6 text-center lg:px-8">
          <p className="font-[family-name:var(--font-display)] text-3xl font-semibold text-ink md:text-4xl">
            {t("ctaTitle")}
          </p>
          <p className="mt-4 text-ink-soft">{t("ctaSubtitle")}</p>
          <div className="mt-8 flex justify-center">
            <MagneticButton
              variant="primary"
              onClick={() => window.dispatchEvent(new CustomEvent("open-gui"))}
            >
              {t("cta")}
            </MagneticButton>
          </div>
        </div>
      </div>
    </section>
  );
}
