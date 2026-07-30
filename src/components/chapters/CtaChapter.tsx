"use client";

import { useTranslations } from "next-intl";
import { Reveal } from "@/components/ui/Reveal";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { ContactForm } from "@/components/ui/ContactForm";
import { CompanyMap } from "@/components/ui/CompanyMap";

export function CtaChapter() {
  const t = useTranslations("cta");

  return (
    <section
      id="contact"
      className="relative py-32 md:py-48"
      aria-labelledby="cta-title"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-white via-ocean/20 to-white" />
      <div className="absolute inset-0 chapter-glow" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
        {/*
          Mobile/tablet: texto → formulário → mapa
          Desktop: texto | formulário (2 linhas)
                   mapa  | (continua formulário)
        */}
        <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-x-16 lg:gap-y-10">
          <div className="order-1">
            <Reveal>
              <h2
                id="cta-title"
                className="font-[family-name:var(--font-display)] text-4xl font-semibold text-ink md:text-6xl"
              >
                {t("title")}
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-6 text-xl text-ink-soft">{t("subtitle")}</p>
            </Reveal>
            <Reveal delay={0.2}>
              <p className="mt-4 text-ink-muted leading-relaxed">{t("description")}</p>
            </Reveal>

            <Reveal delay={0.3}>
              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <MagneticButton variant="primary">
                  {t("primary")}
                </MagneticButton>
                <a href={`tel:${t("phone").replace(/\s/g, "")}`}>
                  <MagneticButton variant="secondary">
                    {t("secondary")}
                  </MagneticButton>
                </a>
              </div>
            </Reveal>

            <Reveal delay={0.4}>
              <div className="mt-10 space-y-3 text-sm text-ink-muted">
                <p>
                  <a
                    href={`tel:${t("phone").replace(/\s/g, "")}`}
                    className="hover:text-azure transition-colors"
                  >
                    {t("phone")}
                  </a>
                </p>
                <p>
                  <a
                    href={`mailto:${t("email")}`}
                    className="hover:text-azure transition-colors"
                  >
                    {t("email")}
                  </a>
                </p>
              </div>
            </Reveal>
          </div>

          <div className="order-2 lg:row-span-2">
            <Reveal delay={0.2}>
              <ContactForm />
            </Reveal>
          </div>

          <div className="order-3">
            <CompanyMap />
          </div>
        </div>
      </div>
    </section>
  );
}
