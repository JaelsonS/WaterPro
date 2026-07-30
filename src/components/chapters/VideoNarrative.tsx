"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { media } from "@/lib/media";
import { Reveal } from "@/components/ui/Reveal";

gsap.registerPlugin(ScrollTrigger);

export function VideoNarrative() {
  const t = useTranslations("science");
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const video = videoRef.current;
    if (!section || !video) return;

    ScrollTrigger.create({
      trigger: section,
      start: "top 80%",
      end: "bottom 20%",
      onEnter: () => video.play().catch(() => {}),
      onLeave: () => video.pause(),
      onEnterBack: () => video.play().catch(() => {}),
      onLeaveBack: () => video.pause(),
    });

    gsap.fromTo(
      video,
      { scale: 1.2, opacity: 0.3 },
      {
        scale: 1,
        opacity: 1,
        scrollTrigger: {
          trigger: section,
          start: "top bottom",
          end: "center center",
          scrub: true,
        },
      }
    );
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative h-[70vh] min-h-[400px] overflow-hidden cinematic-flow"
      aria-hidden="true"
    >
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover"
        muted
        loop
        playsInline
        preload="none"
        poster={media.video.poster}
      >
        <source src={media.video.waterDrops} type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-white/55 to-white/90" />

      <div className="relative z-10 flex h-full items-center justify-center px-6">
        <Reveal>
          <p className="max-w-xl text-center font-[family-name:var(--font-display)] text-3xl font-semibold text-ink text-on-media md:text-5xl">
            {t("subtitle")}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
