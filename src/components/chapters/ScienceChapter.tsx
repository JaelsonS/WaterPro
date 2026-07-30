"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Reveal } from "@/components/ui/Reveal";
import { MagneticButton } from "@/components/ui/MagneticButton";

gsap.registerPlugin(ScrollTrigger);

export function ScienceChapter() {
  const t = useTranslations("science");
  const timelineRef = useRef<HTMLDivElement>(null);

  const process = [0, 1, 2, 3].map((i) => ({
    step: t(`process.${i}.step`),
    title: t(`process.${i}.title`),
    description: t(`process.${i}.description`),
  }));

  const technologies = [0, 1, 2, 3, 4, 5].map((i) =>
    t(`technologies.${i}`)
  );

  useEffect(() => {
    const timeline = timelineRef.current;
    if (!timeline) return;

    const line = timeline.querySelector(".timeline-line");
    if (!line) return;

    gsap.fromTo(
      line,
      { scaleY: 0 },
      {
        scaleY: 1,
        ease: "none",
        scrollTrigger: {
          trigger: timeline,
          start: "top 70%",
          end: "bottom 30%",
          scrub: true,
        },
      }
    );
  }, []);

  return (
    <section
      id="science"
      className="relative py-32 md:py-48"
      aria-labelledby="science-title"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-white via-ocean/10 to-white" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mb-20 text-center">
          <Reveal>
            <h2
              id="science-title"
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

        <div ref={timelineRef} className="relative mb-20">
          <div className="timeline-line absolute left-6 top-0 h-full w-[1px] origin-top bg-gradient-to-b from-cyan/60 via-azure/40 to-transparent md:left-1/2 md:-translate-x-1/2" />

          <div className="space-y-16">
            {process.map((step, i) => (
              <Reveal key={i} delay={i * 0.1} direction={i % 2 === 0 ? "left" : "right"}>
                <div
                  className={`relative flex items-center gap-8 ${
                    i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                  }`}
                >
                  <div className="hidden md:block md:w-1/2" />
                  <div className="absolute left-6 z-10 flex h-12 w-12 -translate-x-1/2 items-center justify-center rounded-full border border-azure/30 bg-ice md:left-1/2">
                    <span className="text-xs font-medium text-azure">{step.step}</span>
                  </div>
                  <div className="ml-16 md:ml-0 md:w-1/2">
                    <div className="glass-panel rounded-2xl p-8 transition-all duration-500 hover:border-azure/20">
                      <h3 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-ink">
                        {step.title}
                      </h3>
                      <p className="mt-4 text-sm leading-relaxed text-ink-soft">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        <Reveal>
          <div className="flex flex-wrap justify-center gap-3">
            {technologies.map((tech, i) => (
              <span
                key={i}
                className="rounded-full border border-slate-line bg-ice px-5 py-2.5 text-sm text-ink-soft transition-all duration-300 hover:border-azure/30 hover:text-azure"
              >
                {tech}
              </span>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.2}>
          <div className="mt-16 text-center">
            <MagneticButton
              variant="secondary"
              onClick={() =>
                document.getElementById("solutions")?.scrollIntoView({ behavior: "smooth" })
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
