"use client";

import { useTranslations } from "next-intl";
import { SafeImage } from "@/components/ui/SafeImage";
import { media } from "@/lib/media";
import { Reveal } from "@/components/ui/Reveal";
import { MagneticButton } from "@/components/ui/MagneticButton";

export function ConsequencesChapter() {
  const t = useTranslations("consequences");

  const cards = [0, 1, 2].map((i) => ({
    title: t(`cards.${i}.title`),
    description: t(`cards.${i}.description`),
  }));

  const images = media.consequences;

  return (
    <section
      id="consequences"
      className="relative py-32 md:py-48"
      aria-labelledby="consequences-title"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-white via-sky to-white" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mb-20 text-center">
          <Reveal>
            <h2
              id="consequences-title"
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

        <div className="grid gap-8 lg:grid-cols-3">
          {cards.map((card, i) => (
            <Reveal key={i} delay={i * 0.15}>
              <article className="group relative overflow-hidden rounded-2xl glass-panel transition-all duration-500 hover:shadow-[0_0_60px_rgba(26,127,184,0.15)]">
                <div className="relative h-56 overflow-hidden">
                  <SafeImage
                    src={images[i]}
                    alt=""
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ice via-sky/60 to-transparent" />
                </div>
                <div className="p-8">
                  <h3 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-ink">
                    {card.title}
                  </h3>
                  <p className="mt-4 text-sm leading-relaxed text-ink-soft">
                    {card.description}
                  </p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.3}>
          <div className="mt-16 text-center">
            <MagneticButton
              variant="primary"
              onClick={() =>
                document.getElementById("science")?.scrollIntoView({ behavior: "smooth" })
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
