"use client";

import { useLocale } from "next-intl";
import { media } from "@/lib/media";
import { SafeImage } from "@/components/ui/SafeImage";
import { Link } from "@/i18n/routing";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { buildGeneralWhatsAppUrl } from "@/lib/config";
import { Reveal } from "@/components/ui/Reveal";

export function ResidentialHero() {
  const locale = useLocale() as "pt" | "en";

  const content = {
    pt: {
      tag: "Para Sua Casa",
      title: "Água pura para quem mais importa",
      subtitle:
        "Cada casa é única. Cada origem de água é diferente. A WaterPro tem a solução certa para a sua situação — desde purificadores de osmose inversa a descalcificadores, torneiras premium e sistemas inteligentes.",
      cta1: "Encontrar a solução ideal",
      cta2: "Falar com um especialista",
    },
    en: {
      tag: "For Your Home",
      title: "Pure water for those who matter most",
      subtitle:
        "Every home is unique. Every water source is different. WaterPro has the right solution for your situation — from reverse osmosis purifiers to water softeners, premium taps and smart systems.",
      cta1: "Find the ideal solution",
      cta2: "Talk to a specialist",
    },
  };

  const t = content[locale];

  return (
    <section className="relative min-h-[70vh] flex items-center overflow-hidden" data-hero-section>
      <div className="absolute inset-0">
        <SafeImage
          src={media.residential.hero}
          alt=""
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/85 to-white/50" />
        <div className="absolute inset-0 chapter-glow" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-32 lg:px-8">
        <Reveal>
          <p className="mb-4 text-xs font-medium uppercase tracking-[0.3em] text-azure/80">
            {t.tag}
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <h1 className="max-w-3xl font-[family-name:var(--font-display)] text-5xl font-semibold leading-tight text-ink md:text-7xl">
            {t.title}
          </h1>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="mt-8 max-w-2xl text-lg leading-relaxed text-ink-soft">
            {t.subtitle}
          </p>
        </Reveal>
        <Reveal delay={0.3}>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <a href="#catalogo">
              <MagneticButton variant="primary">{t.cta1}</MagneticButton>
            </a>
            <a href={buildGeneralWhatsAppUrl(locale)} target="_blank" rel="noopener noreferrer">
              <MagneticButton variant="secondary">{t.cta2}</MagneticButton>
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
