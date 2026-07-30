"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Reveal } from "@/components/ui/Reveal";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { cn } from "@/lib/utils";

const AUTO_INTERVAL_MS = 6000;

export function TestimonialsChapter() {
  const t = useTranslations("testimonials");
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStart = useRef(0);

  const items = [0, 1, 2].map((i) => ({
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
        <div className="mb-20 text-center">
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
              <svg
                className="h-10 w-10 text-azure/30"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.432.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
              </svg>
              <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-medium tracking-wide text-ink shadow-sm">
                {active + 1} / {items.length}
              </span>
            </div>

            <blockquote
              key={active}
              className="min-h-[140px] animate-fade-in"
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

            {/* Progress bar do autoplay */}
            <div className="absolute bottom-0 left-0 right-0 h-1 overflow-hidden rounded-b-3xl bg-slate-line/60">
              <div
                key={`${active}-${paused}`}
                className={cn(
                  "h-full bg-azure/70 origin-left",
                  !paused && "animate-[testimonial-progress_6s_linear]"
                )}
                style={paused ? { width: "0%" } : undefined}
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
