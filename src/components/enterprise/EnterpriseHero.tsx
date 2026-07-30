"use client";

import { media } from "@/lib/media";
import { SafeImage } from "@/components/ui/SafeImage";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { Reveal } from "@/components/ui/Reveal";
import { buildGeneralWhatsAppUrl } from "@/lib/config";

export function EnterpriseHero() {
  const locale = useLocale() as "pt" | "en";

  const content = {
    pt: {
      tag: "Para a Sua Empresa",
      title: "Soluções inteligentes de água para empresas exigentes",
      subtitle:
        "Escritórios, hotéis, restaurantes, clínicas e indústria confiam na WaterPro para elevar a experiência de clientes e colaboradores — com tecnologia profissional, design premium e água de excelência.",
      cta1: "Encontrar a solução ideal",
      cta2: "Falar com um consultor",
    },
    en: {
      tag: "For Your Business",
      title: "Smart water solutions for demanding businesses",
      subtitle:
        "Offices, hotels, restaurants, clinics and industry trust WaterPro to elevate the experience for clients and teams — with professional technology, premium design and excellent water quality.",
      cta1: "Find the ideal solution",
      cta2: "Talk to a consultant",
    },
  };

  const t = content[locale];

  return (
    <section className="relative min-h-[70vh] flex items-center overflow-hidden" data-hero-section>
      <div className="absolute inset-0">
        <SafeImage
          src={media.enterprise.hero}
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
          <h1 className="max-w-4xl font-[family-name:var(--font-display)] text-4xl font-semibold leading-tight text-ink md:text-6xl lg:text-7xl">
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
