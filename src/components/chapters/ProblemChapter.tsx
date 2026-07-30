"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Reveal } from "@/components/ui/Reveal";
import { MagneticButton } from "@/components/ui/MagneticButton";

gsap.registerPlugin(ScrollTrigger);

export function ProblemChapter() {
  const t = useTranslations("problem");
  const sectionRef = useRef<HTMLElement>(null);

  const stats = [
    { value: t("stats.hardness.value"), label: t("stats.hardness.label") },
    { value: t("stats.contaminants.value"), label: t("stats.contaminants.label") },
    { value: t("stats.health.value"), label: t("stats.health.label") },
  ];

  const points = [
    t("points.0"),
    t("points.1"),
    t("points.2"),
    t("points.3"),
  ];

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    gsap.fromTo(
      section,
      { backgroundColor: "#ffffff" },
      {
        backgroundColor: "#f0f9ff",
        scrollTrigger: {
          trigger: section,
          start: "top 60%",
          end: "bottom 20%",
          scrub: true,
        },
      }
    );
  }, []);

  return (
    <section
      ref={sectionRef}
      id="problem"
      className="relative py-32 md:py-48 section-blend-top cinematic-flow bg-white"
      aria-labelledby="problem-title"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-white via-sky/30 to-ice" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mb-20 text-center">
          <Reveal>
            <h2
              id="problem-title"
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

        <div className="mb-20 grid gap-8 md:grid-cols-3">
          {stats.map((stat, i) => (
            <Reveal key={i} delay={i * 0.15}>
              <div className="glass-panel group rounded-2xl p-8 text-center transition-all duration-500 hover:border-azure/20 hover:shadow-[0_0_40px_rgba(26,127,184,0.1)]">
                <div className="font-[family-name:var(--font-display)] text-5xl font-semibold text-gradient-water md:text-6xl">
                  {stat.value}
                </div>
                <p className="mt-4 text-sm leading-relaxed text-ink-soft">
                  {stat.label}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {points.map((point, i) => (
            <Reveal key={i} delay={i * 0.1} direction={i % 2 === 0 ? "left" : "right"}>
              <div className="flex items-start gap-4 rounded-xl border border-slate-line bg-white/[0.02] p-6 transition-all duration-300 hover:border-azure/10 hover:bg-ice">
                <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-azure/10">
                  <svg className="h-4 w-4 text-azure" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" />
                  </svg>
                </div>
                <p className="text-ink-soft leading-relaxed">{point}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.3}>
          <div className="mt-16 text-center">
            <MagneticButton
              variant="secondary"
              onClick={() =>
                document.getElementById("consequences")?.scrollIntoView({ behavior: "smooth" })
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
