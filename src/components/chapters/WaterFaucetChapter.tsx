"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { media } from "@/lib/media";
import { Reveal } from "@/components/ui/Reveal";

gsap.registerPlugin(ScrollTrigger);

export function WaterFaucetChapter() {
  const t = useTranslations("faucet");
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const video = videoRef.current;
    if (!section || !video) return;

    ScrollTrigger.create({
      trigger: section,
      start: "top 75%",
      end: "bottom 25%",
      onEnter: () => video.play().catch(() => {}),
      onLeave: () => video.pause(),
      onEnterBack: () => video.play().catch(() => {}),
      onLeaveBack: () => video.pause(),
    });
  }, []);

  return (
    <section
      ref={sectionRef}
      id="pureza"
      className="relative overflow-hidden bg-white py-20 md:py-28"
      aria-labelledby="faucet-title"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-azure">
              {t("tag")}
            </p>
            <h2
              id="faucet-title"
              className="font-[family-name:var(--font-display)] text-4xl font-semibold text-ink md:text-5xl"
            >
              {t("title")}
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-ink-soft">{t("subtitle")}</p>
            <ul className="mt-8 space-y-3">
              {[0, 1, 2].map((i) => (
                <li key={i} className="flex items-start gap-3 text-ink-soft">
                  <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sky text-xs text-azure">
                    ✓
                  </span>
                  {t(`points.${i}`)}
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-slate-line bg-sky shadow-[0_20px_60px_rgba(26,127,184,0.12)] md:aspect-square">
              <video
                ref={videoRef}
                className="h-full w-full object-cover"
                muted
                loop
                playsInline
                preload="metadata"
                poster={media.video.faucetPoster}
                aria-label={t("videoLabel")}
              >
                <source src={media.video.faucet} type="video/mp4" />
              </video>
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-white/30 via-transparent to-white/10" />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
