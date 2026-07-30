"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Reveal } from "@/components/ui/Reveal";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { cn } from "@/lib/utils";

const AUTO_INTERVAL_MS = 6500;

export function TestimonialsChapter() {
  const t = useTranslations("testimonials");
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStart = useRef(0);

  const items = [0, 1, 2, 3].map((i) => ({
    quote: t(`items.${i}.quote`),
    author: t(`items.${i}.author`),
    role: t(`items.${i}.role`),
    type: t(`items.${i}.type`),
  }));

  const next = useCallback(() => {
    setActive((prev) => (prev + 1) % items.length);
  }, [items.length]);

  const prev = useCallback(() => {
    setActive((prev) => (prev - 1 + items.length) % items.length);
  }, [items.length]);

  useEffect(() => {
    if (paused || items.length <= 1) return;
    const timer = setInterval(next, AUTO_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [paused, next, items.length]);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStart.current = e.touches[0].clientX;
    setPaused(true);
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStart.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) next();
      else prev();
    }
    setPaused(false);
  };

  return (
    <section
      id="testimonials"
      className="relative py-32 md:py-48"
      aria-labelledby="testimonials-title"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-white via-ocean/5 to-white" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mb-12 text-center md:mb-16">
          <Reveal>
            <h2
              id="testimonials-title"
              className="font-[family-name:var(--font-display)] text-4xl font-semibold text-ink md:text-6xl"
            >
              {t("title")}
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-ink-soft">
              {t("subtitle")}
            </p>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="mx-auto mt-10 inline-flex flex-col items-center gap-3 rounded-3xl border border-slate-line bg-white px-8 py-6 shadow-[0_8px_32px_rgba(15,23,42,0.06)] sm:flex-row sm:gap-8">
              <div className="text-center sm:text-left">
                <p className="font-[family-name:var(--font-display)] text-5xl font-semibold text-ink">
                  {t("rating")}
                </p>
                <div className="mt-1 flex justify-center gap-0.5 text-amber-400 sm:justify-start" aria-hidden="true">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i}>★</span>
                  ))}
                </div>
                <p className="mt-1 text-sm text-ink-muted">{t("ratingLabel")}</p>
              </div>
              <div className="hidden h-16 w-px bg-slate-line sm:block" />
              <div className="text-center sm:text-left">
                <p className="text-sm font-medium text-azure">{t("source")}</p>
                <p className="mt-1 text-lg font-semibold text-ink">{t("reviewCount")}</p>
                <div className="mt-3 space-y-1" aria-hidden="true">
                  {[5, 4, 3, 2, 1].map((star) => (
                    <div key={star} className="flex items-center gap-2">
                      <span className="w-3 text-xs text-ink-muted">{star}</span>
                      <div className="h-1.5 w-28 overflow-hidden rounded-full bg-slate-line">
                        <div
                          className="h-full rounded-full bg-amber-400"
                          style={{ width: star === 5 ? "100%" : "0%" }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </div>

        <div
          className="relative mx-auto max-w-4xl"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          role="region"
          aria-roledescription="carousel"
          aria-label={t("title")}
        >
          <div className="glass-panel relative rounded-3xl p-10 md:p-16">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div className="flex items-center gap-1 text-amber-400" aria-label="5 estrelas">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i}>★</span>
                ))}
              </div>
              <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-medium tracking-wide text-ink shadow-sm">
                {active + 1} / {items.length}
              </span>
            </div>

            <blockquote
              key={active}
              className="min-h-[160px] animate-fade-in"
              aria-live="polite"
            >
              <p className="font-[family-name:var(--font-display)] text-2xl font-semibold leading-relaxed text-ink md:text-3xl">
                &ldquo;{items[active].quote}&rdquo;
              </p>
            </blockquote>

            <div className="mt-10 flex items-center justify-between gap-4">
              <div>
                <p className="font-medium text-ink">{items[active].author}</p>
                <p className="text-sm text-ink-muted">{items[active].role}</p>
              </div>
              <span className="shrink-0 rounded-full bg-azure/10 px-4 py-1.5 text-xs text-azure">
                {items[active].type}
              </span>
            </div>

            <div className="absolute bottom-0 left-0 right-0 h-1 overflow-hidden rounded-b-3xl bg-slate-line/60">
              <div
                key={`${active}-${paused}`}
                className={cn(
                  "h-full origin-left bg-azure/70",
                  !paused && "animate-[testimonial-progress_6.5s_linear]"
                )}
              />
            </div>
          </div>

          <div className="mt-8 flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={prev}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-line bg-white text-ink shadow-sm transition-colors hover:border-azure hover:text-azure"
              aria-label={t("prev")}
            >
              ←
            </button>

            <div className="flex items-center gap-2 rounded-full bg-white/90 px-3 py-2 shadow-sm">
              {items.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActive(i)}
                  className={cn(
                    "rounded-full transition-all duration-300",
                    i === active
                      ? "h-2.5 w-8 bg-azure"
                      : "h-2.5 w-2.5 bg-ink/20 hover:bg-azure/50"
                  )}
                  aria-label={`${t("goTo")} ${i + 1}`}
                  aria-current={i === active}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={next}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-line bg-white text-ink shadow-sm transition-colors hover:border-azure hover:text-azure"
              aria-label={t("next")}
            >
              →
            </button>
          </div>
        </div>

        <Reveal delay={0.3}>
          <div className="mt-16 text-center">
            <MagneticButton
              variant="secondary"
              onClick={() =>
                document.getElementById("trust")?.scrollIntoView({ behavior: "smooth" })
              }
            >
              {t("cta")}
            </MagneticButton>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
