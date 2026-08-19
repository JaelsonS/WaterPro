"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { media } from "@/lib/media";
import { buildGeneralWhatsAppUrl } from "@/lib/config";
import { HeroBackdrop } from "@/components/ui/HeroBackdrop";
import { HeroWaterfall } from "@/components/ui/HeroWaterfall";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { Reveal } from "@/components/ui/Reveal";
import { prefersReducedMotion } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

export function HeroChapter() {
  const t = useTranslations("hero");
  const locale = useLocale() as "pt" | "en";
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const titleBefore = t("titleBefore");
  const titleAccent = t("titleAccent");
  const fullTitle = `${titleBefore}${titleAccent}`;

  const [typed, setTyped] = useState("");
  const [done, setDone] = useState(false);

  const slides = useMemo(
    () =>
      media.hero.slides.map((slide) => ({
        src: slide.src,
        alt: slide.alt,
      })),
    []
  );

  useEffect(() => {
    if (prefersReducedMotion()) {
      setTyped(fullTitle);
      setDone(true);
      return;
    }

    let i = 0;
    setTyped("");
    setDone(false);
    const speed = 42;
    const timer = setInterval(() => {
      i += 1;
      setTyped(fullTitle.slice(0, i));
      if (i >= fullTitle.length) {
        clearInterval(timer);
        setDone(true);
      }
    }, speed);

    return () => clearInterval(timer);
  }, [fullTitle]);

  useEffect(() => {
    const section = sectionRef.current;
    const content = contentRef.current;
    if (!section || !content) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: "bottom top",
        scrub: 1,
      },
    });

    tl.to(content, { y: -60, opacity: 0.55, ease: "none" }, 0);

    return () => {
      tl.scrollTrigger?.kill();
      tl.kill();
    };
  }, []);

  const beforeShown = typed.slice(0, Math.min(typed.length, titleBefore.length));
  const accentShown =
    typed.length > titleBefore.length ? typed.slice(titleBefore.length) : "";

  return (
    <section
      ref={sectionRef}
      id="hero"
      data-hero-section
      className="relative z-[5] min-h-[100svh] overflow-hidden bg-ice isolate"
      aria-label={t("title")}
    >
      {/* Sequência full-bleed — fotos atmosféricas, ordem aleatória */}
      <HeroBackdrop slides={slides} className="z-0" interval={5500} />

      <div className="pointer-events-none absolute inset-0 z-[1] opacity-25">
        <HeroWaterfall />
      </div>

      <div
        ref={contentRef}
        className="relative z-10 flex min-h-[100svh] flex-col items-center justify-center px-6 pt-28 pb-32 text-center pointer-events-none"
      >
        <div className="relative mx-auto w-full max-w-5xl">
          {/* Halo de leitura — sem “card”, só contraste atrás do texto */}
          <div
            className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[120%] w-[110%] -translate-x-1/2 -translate-y-1/2 rounded-[50%] bg-white/55 blur-2xl"
            aria-hidden="true"
          />

          <Reveal>
            <p className="mb-6 text-xs font-bold uppercase tracking-[0.35em] text-azure [text-shadow:0_1px_0_rgba(255,255,255,1),0_0_24px_rgba(255,255,255,0.95)]">
              {t("tag")}
            </p>
          </Reveal>

          <h1
            className="max-w-5xl font-[family-name:var(--font-display)] text-[2.5rem] font-semibold leading-[1.12] tracking-tight sm:text-5xl md:text-7xl lg:text-[5.25rem] [word-break:normal] [overflow-wrap:normal]"
            aria-label={fullTitle}
          >
            <span className="text-ink [text-shadow:0_2px_0_rgba(255,255,255,0.95),0_4px_32px_rgba(255,255,255,1),0_0_60px_rgba(255,255,255,0.9)]">
              {beforeShown}
            </span>
            <span className="text-azure [text-shadow:0_2px_0_rgba(255,255,255,0.95),0_4px_28px_rgba(255,255,255,1)]">
              {accentShown}
            </span>
            <span
              className={`ml-0.5 inline-block h-[0.85em] w-[3px] translate-y-[0.08em] rounded-sm bg-azure align-baseline shadow-[0_0_12px_rgba(255,255,255,1)] ${
                done ? "animate-pulse opacity-0" : "animate-pulse opacity-100"
              }`}
              aria-hidden="true"
            />
          </h1>

          <Reveal delay={0.45}>
            <p className="mx-auto mt-8 max-w-2xl text-lg font-semibold leading-relaxed text-ink md:text-xl [text-shadow:0_1px_0_rgba(255,255,255,1),0_0_28px_rgba(255,255,255,0.95)]">
              {t("subtitle")}
            </p>
          </Reveal>

          <Reveal delay={0.65}>
            <div className="mt-12 flex flex-col items-center justify-center gap-4 pointer-events-auto sm:flex-row">
              <MagneticButton
                variant="primary"
                onClick={() =>
                  document.getElementById("families")?.scrollIntoView({ behavior: "smooth" })
                }
              >
                {t("cta")}
              </MagneticButton>
              <MagneticButton
                variant="secondary"
                onClick={() =>
                  window.open(buildGeneralWhatsAppUrl(locale), "_blank", "noopener,noreferrer")
                }
              >
                {t("ctaGui")}
              </MagneticButton>
            </div>
          </Reveal>
        </div>

        <div className="absolute bottom-10 left-1/2 z-10 -translate-x-1/2">
          <div className="flex flex-col items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-ink [text-shadow:0_1px_8px_rgba(255,255,255,1)]">
              {t("scroll")}
            </span>
            <div className="flex flex-col items-center gap-1">
              <div className="h-2 w-2 animate-bounce rounded-full bg-azure shadow-[0_0_10px_rgba(255,255,255,1)]" />
              <div className="h-10 w-px bg-gradient-to-b from-azure/80 to-transparent" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
