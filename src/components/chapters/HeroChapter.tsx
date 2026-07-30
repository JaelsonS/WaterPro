"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { media } from "@/lib/media";
import { ImageCarousel } from "@/components/ui/ImageCarousel";
import { HeroWaterfall } from "@/components/ui/HeroWaterfall";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { Reveal } from "@/components/ui/Reveal";
import { prefersReducedMotion } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

export function HeroChapter() {
  const t = useTranslations("hero");
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const titleBefore = t("titleBefore");
  const titleAccent = t("titleAccent");
  const fullTitle = `${titleBefore}${titleAccent}`;

  const [typed, setTyped] = useState("");
  const [done, setDone] = useState(false);

  const slides = media.hero.slides.map((slide, i) => ({
    src: slide.src,
    alt: slide.alt,
    caption: t(`slides.${i}`),
  }));

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
      {/* Sequência full-bleed — passa sozinha, ordem aleatória */}
      <ImageCarousel
        slides={slides}
        className="absolute inset-0 z-0 h-full w-full"
        imageClassName="object-cover"
        showCaptions={false}
        showDots
        showArrows={false}
        overlay="hero"
        priority
        interval={5500}
        shuffle
        autoplayLocked
      />

      <div className="pointer-events-none absolute inset-0 z-[1] opacity-30">
        <HeroWaterfall />
      </div>

      <div
        ref={contentRef}
        className="relative z-10 flex min-h-[100svh] flex-col items-center justify-center px-6 pt-28 pb-32 text-center pointer-events-none"
      >
        <Reveal>
          <p className="mb-6 text-xs font-semibold uppercase tracking-[0.35em] text-azure drop-shadow-[0_1px_12px_rgba(255,255,255,0.9)]">
            {t("tag")}
          </p>
        </Reveal>

        <h1
          className="max-w-5xl font-[family-name:var(--font-display)] text-[2.5rem] font-semibold leading-[1.12] tracking-tight sm:text-5xl md:text-7xl lg:text-[5.25rem] [word-break:normal] [overflow-wrap:normal]"
          aria-label={fullTitle}
        >
          <span className="text-ink drop-shadow-[0_2px_28px_rgba(255,255,255,0.95)]">
            {beforeShown}
          </span>
          <span className="bg-gradient-to-r from-azure to-cyan bg-clip-text text-transparent">
            {accentShown}
          </span>
          <span
            className={`ml-0.5 inline-block h-[0.85em] w-[3px] translate-y-[0.08em] rounded-sm bg-azure align-baseline ${
              done ? "animate-pulse opacity-0" : "animate-pulse opacity-100"
            }`}
            aria-hidden="true"
          />
        </h1>

        <Reveal delay={0.45}>
          <p className="mx-auto mt-8 max-w-2xl text-lg font-medium leading-relaxed text-ink-soft drop-shadow-[0_1px_16px_rgba(255,255,255,0.9)] md:text-xl">
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
              onClick={() => window.dispatchEvent(new CustomEvent("open-gui"))}
            >
              {t("ctaGui")}
            </MagneticButton>
          </div>
        </Reveal>

        <div className="absolute bottom-10 left-1/2 z-10 -translate-x-1/2">
          <div className="flex flex-col items-center gap-3">
            <span className="text-xs font-medium uppercase tracking-[0.2em] text-ink-soft">
              {t("scroll")}
            </span>
            <div className="flex flex-col items-center gap-1">
              <div className="h-2 w-2 animate-bounce rounded-full bg-azure" />
              <div className="h-10 w-px bg-gradient-to-b from-azure/80 to-transparent" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
