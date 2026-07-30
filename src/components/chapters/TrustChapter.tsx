"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Reveal } from "@/components/ui/Reveal";

export function TrustChapter() {
  const t = useTranslations("trust");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const stats = [0, 1, 2, 3].map((i) => ({
    value: t(`stats.${i}.value`),
    label: t(`stats.${i}.label`),
  }));

  const certifications = [0, 1, 2, 3].map((i) => t(`certifications.${i}`));

  const journeySteps = [0, 1, 2, 3].map((i) => ({
    title: t(`journey.steps.${i}.title`),
    description: t(`journey.steps.${i}.description`),
  }));

  const faqItems = [0, 1, 2, 3].map((i) => ({
    question: t(`faq.items.${i}.question`),
    answer: t(`faq.items.${i}.answer`),
  }));

  return (
    <section
      id="trust"
      className="relative py-32 md:py-48"
      aria-labelledby="trust-title"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-white via-sky/20 to-white" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mb-20 text-center">
          <Reveal>
            <h2
              id="trust-title"
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

        <div className="mb-24 grid grid-cols-2 gap-6 md:grid-cols-4">
          {stats.map((stat, i) => (
            <Reveal key={i} delay={i * 0.1}>
              <div className="text-center">
                <div className="font-[family-name:var(--font-display)] text-4xl font-semibold text-gradient-water md:text-5xl">
                  {stat.value}
                </div>
                <p className="mt-2 text-sm text-ink-muted">{stat.label}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <div className="mb-24 flex flex-wrap justify-center gap-4">
            {certifications.map((cert, i) => (
              <div
                key={i}
                className="flex items-center gap-2 rounded-full border border-slate-line bg-ice px-6 py-3"
              >
                <svg className="h-4 w-4 text-azure" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.374 3.374 0 01-.753 3.668l-.984.984a1.125 1.125 0 01-1.591 0l-.984-.984a3.374 3.374 0 01-.753-3.668A9.965 9.965 0 013 12c0-1.268.63-2.39 1.593-3.068a3.374 3.374 0 01.753-3.668l.984-.984a1.125 1.125 0 011.591 0l.984.984a3.374 3.374 0 01.753 3.668A9.965 9.965 0 0121 12z" />
                </svg>
                <span className="text-sm text-ink-soft">{cert}</span>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal>
          <h3 className="mb-12 text-center font-[family-name:var(--font-display)] text-3xl font-semibold text-ink">
            {t("journey.title")}
          </h3>
        </Reveal>

        <div className="mb-24 grid gap-6 md:grid-cols-4">
          {journeySteps.map((step, i) => (
            <Reveal key={i} delay={i * 0.1}>
              <div className="relative glass-panel rounded-2xl p-6 text-center">
                <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-azure/10 text-sm font-medium text-azure">
                  {i + 1}
                </div>
                <h4 className="font-medium text-ink">{step.title}</h4>
                <p className="mt-3 text-sm leading-relaxed text-ink-muted">
                  {step.description}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <h3 className="mb-8 text-center font-[family-name:var(--font-display)] text-3xl font-semibold text-ink">
            {t("faq.title")}
          </h3>
        </Reveal>

        <div className="mx-auto max-w-3xl space-y-3">
          {faqItems.map((item, i) => (
            <Reveal key={i} delay={i * 0.05}>
              <div className="glass-panel overflow-hidden rounded-xl">
                <button
                  className="flex w-full items-center justify-between p-6 text-left"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  aria-expanded={openFaq === i}
                >
                  <span className="font-medium text-ink pr-4">{item.question}</span>
                  <svg
                    className={`h-5 w-5 shrink-0 text-azure transition-transform duration-300 ${
                      openFaq === i ? "rotate-180" : ""
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    openFaq === i ? "max-h-48 opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <p className="px-6 pb-6 text-sm leading-relaxed text-ink-soft">
                    {item.answer}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
