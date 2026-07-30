"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Reveal } from "@/components/ui/Reveal";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { media } from "@/lib/media";
import { SafeImage } from "@/components/ui/SafeImage";

const VALUE_ICONS = ["🤝", "💎", "💡", "🌱", "⭐"] as const;
const JOURNEY_STEPS = [0, 1, 2, 3] as const;

export function AboutChapter({ showHero = true }: { showHero?: boolean }) {
  const t = useTranslations("about");

  return (
    <div className="relative overflow-hidden">
      {showHero && (
        <section className="relative bg-ice pt-32 pb-20 md:pt-40 md:pb-28">
          <div className="absolute inset-0 chapter-glow opacity-50" />
          <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
            <Reveal>
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-azure">
                {t("tag")}
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <h1 className="max-w-4xl font-[family-name:var(--font-display)] text-4xl font-semibold text-ink md:text-6xl lg:text-7xl">
                {t("title")}
              </h1>
            </Reveal>
            <Reveal delay={0.2}>
              <p className="mt-6 max-w-3xl text-xl leading-relaxed text-ink-soft">
                {t("lead")}
              </p>
            </Reveal>
          </div>
        </section>
      )}

      <section className="relative bg-white py-20 md:py-28" aria-labelledby="about-who">
        <div className="mx-auto grid max-w-7xl items-center gap-16 px-6 lg:grid-cols-2 lg:px-8">
          <Reveal>
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-azure">
                {t("who.tag")}
              </p>
              <h2
                id="about-who"
                className="font-[family-name:var(--font-display)] text-3xl font-semibold text-ink md:text-5xl"
              >
                {t("who.title")}
              </h2>
              <p className="mt-6 text-lg leading-relaxed text-ink-soft">{t("who.p1")}</p>
              <p className="mt-4 leading-relaxed text-ink-muted">{t("who.p2")}</p>
              <p className="mt-4 leading-relaxed text-ink-muted">{t("who.p3")}</p>
            </div>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-slate-line shadow-[0_20px_60px_rgba(26,127,184,0.1)]">
              <SafeImage
                src={media.residential.hero}
                alt={t("who.imageAlt")}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-white/40 via-transparent to-transparent" />
            </div>
          </Reveal>
        </div>
      </section>

      <section className="relative bg-ice py-20 md:py-28" aria-labelledby="about-pillars">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <Reveal>
            <h2 id="about-pillars" className="sr-only">
              {t("pillars.srTitle")}
            </h2>
          </Reveal>
          <div className="grid gap-8 md:grid-cols-3">
            {(["mission", "vision", "promise"] as const).map((key, i) => (
              <Reveal key={key} delay={i * 0.1}>
                <article className="card-light h-full rounded-3xl border border-slate-line bg-white p-8">
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-azure">
                    {t(`pillars.${key}.label`)}
                  </p>
                  <h3 className="mt-4 font-[family-name:var(--font-display)] text-2xl font-semibold text-ink">
                    {t(`pillars.${key}.title`)}
                  </h3>
                  <p className="mt-4 leading-relaxed text-ink-soft">
                    {t(`pillars.${key}.description`)}
                  </p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="relative bg-white py-20 md:py-28" aria-labelledby="about-values">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <Reveal>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-azure">
              {t("values.tag")}
            </p>
            <h2
              id="about-values"
              className="max-w-2xl font-[family-name:var(--font-display)] text-3xl font-semibold text-ink md:text-5xl"
            >
              {t("values.title")}
            </h2>
            <p className="mt-4 max-w-2xl text-ink-soft">{t("values.subtitle")}</p>
          </Reveal>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2, 3, 4].map((i) => (
              <Reveal key={i} delay={i * 0.08}>
                <article className="rounded-2xl border border-slate-line bg-ice/60 p-6">
                  <span className="text-2xl" aria-hidden="true">
                    {VALUE_ICONS[i]}
                  </span>
                  <h3 className="mt-3 font-medium text-ink">{t(`values.items.${i}.title`)}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                    {t(`values.items.${i}.description`)}
                  </p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="relative bg-ice py-20 md:py-28" aria-labelledby="about-journey">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <Reveal>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-azure">
              {t("journey.tag")}
            </p>
            <h2
              id="about-journey"
              className="max-w-3xl font-[family-name:var(--font-display)] text-3xl font-semibold text-ink md:text-5xl"
            >
              {t("journey.title")}
            </h2>
            <p className="mt-4 max-w-3xl text-lg text-ink-soft">{t("journey.subtitle")}</p>
          </Reveal>
          <ol className="mt-14 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {JOURNEY_STEPS.map((step, i) => (
              <Reveal key={step} delay={i * 0.1}>
                <li className="relative">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-azure text-sm font-semibold text-white">
                    {step + 1}
                  </span>
                  <h3 className="mt-4 font-[family-name:var(--font-display)] text-xl font-semibold text-ink">
                    {t(`journey.steps.${step}.title`)}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                    {t(`journey.steps.${step}.description`)}
                  </p>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <section className="relative bg-white py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-6 text-center lg:px-8">
          <Reveal>
            <h2 className="font-[family-name:var(--font-display)] text-3xl font-semibold text-ink md:text-4xl">
              {t("cta.title")}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-ink-soft">{t("cta.subtitle")}</p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/para-sua-casa">
                <MagneticButton variant="primary">{t("cta.residential")}</MagneticButton>
              </Link>
              <Link href="/para-a-sua-empresa">
                <MagneticButton variant="secondary">{t("cta.business")}</MagneticButton>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
