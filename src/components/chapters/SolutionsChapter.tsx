"use client";

import { useTranslations } from "next-intl";
import { media } from "@/lib/media";
import { SafeImage } from "@/components/ui/SafeImage";
import { Reveal } from "@/components/ui/Reveal";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { Link } from "@/i18n/routing";

export function SolutionsChapter() {
  const t = useTranslations("solutions");

  const solutions = [
    {
      tag: t("residential.tag"),
      title: t("residential.title"),
      description: t("residential.description"),
      features: [0, 1, 2, 3].map((i) => t(`residential.features.${i}`)),
      cta: t("residential.cta"),
      image: media.solutions.residential,
      target: "/para-sua-casa",
      isPage: true,
    },
    {
      tag: t("commercial.tag"),
      title: t("commercial.title"),
      description: t("commercial.description"),
      features: [0, 1, 2, 3].map((i) => t(`commercial.features.${i}`)),
      cta: t("commercial.cta"),
      image: media.solutions.commercial,
      target: "/para-a-sua-empresa",
      isPage: true,
    },
  ];

  return (
    <section
      id="solutions"
      className="relative py-32 md:py-48"
      aria-labelledby="solutions-title"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-white via-sky/30 to-white" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mb-20 text-center">
          <Reveal>
            <h2
              id="solutions-title"
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

        <div className="space-y-24">
          {solutions.map((solution, i) => (
            <Reveal key={i} delay={0.1}>
              <div
                className={`grid items-center gap-12 lg:grid-cols-2 ${
                  i % 2 === 1 ? "lg:direction-rtl" : ""
                }`}
              >
                <div className={`${i % 2 === 1 ? "lg:order-2" : ""}`}>
                  <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
                    <SafeImage
                      src={solution.image}
                      alt={solution.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ice/80 via-transparent to-transparent" />
                    <span className="absolute bottom-6 left-6 rounded-full bg-azure/20 px-4 py-1.5 text-xs font-medium text-azure backdrop-blur-sm">
                      {solution.tag}
                    </span>
                  </div>
                </div>

                <div className={`${i % 2 === 1 ? "lg:order-1" : ""}`}>
                  <h3 className="font-[family-name:var(--font-display)] text-3xl font-semibold text-ink md:text-4xl">
                    {solution.title}
                  </h3>
                  <p className="mt-6 text-ink-soft leading-relaxed">
                    {solution.description}
                  </p>
                  <ul className="mt-8 space-y-4">
                    {solution.features.map((feature, j) => (
                      <li key={j} className="flex items-center gap-3 text-ink-soft">
                        <svg className="h-5 w-5 shrink-0 text-azure" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-10">
                    {solution.isPage ? (
                      <Link href={solution.target}>
                        <MagneticButton variant={i === 0 ? "primary" : "secondary"}>
                          {solution.cta}
                        </MagneticButton>
                      </Link>
                    ) : (
                      <MagneticButton
                        variant={i === 0 ? "primary" : "secondary"}
                        onClick={() =>
                          document.getElementById(solution.target)?.scrollIntoView({ behavior: "smooth" })
                        }
                      >
                        {solution.cta}
                      </MagneticButton>
                    )}
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
