import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { FamiliesChapter } from "@/components/chapters/FamiliesChapter";
import { HeroChapter } from "@/components/chapters/HeroChapter";
import { ProblemChapter } from "@/components/chapters/ProblemChapter";
import { ConsequencesChapter } from "@/components/chapters/ConsequencesChapter";
import { ScienceChapter } from "@/components/chapters/ScienceChapter";
import { SolutionsChapter } from "@/components/chapters/SolutionsChapter";
import { TestimonialsChapter } from "@/components/chapters/TestimonialsChapter";
import { TrustChapter } from "@/components/chapters/TrustChapter";
import { CtaChapter } from "@/components/chapters/CtaChapter";
import { WaterFaucetChapter } from "@/components/chapters/WaterFaucetChapter";
import { VideoNarrative } from "@/components/chapters/VideoNarrative";
import { getFAQSchema } from "@/lib/seo";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });

  return {
    title: t("title"),
    description: t("description"),
    keywords: t("keywords"),
    openGraph: {
      title: t("title"),
      description: t("description"),
      url: locale === "pt" ? "https://waterpro.pt" : `https://waterpro.pt/${locale}`,
      siteName: "WaterPro",
      locale: locale === "pt" ? "pt_PT" : "en_US",
      type: "website",
    },
    alternates: {
      canonical: locale === "pt" ? "https://waterpro.pt" : `https://waterpro.pt/${locale}`,
      languages: { pt: "https://waterpro.pt", en: "https://waterpro.pt/en" },
    },
  };
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "trust.faq" });

  const faqItems = [0, 1, 2, 3].map((i) => ({
    question: t(`items.${i}.question`),
    answer: t(`items.${i}.answer`),
  }));

  const faqSchema = getFAQSchema(faqItems);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <HeroChapter />
      <FamiliesChapter />
      <ProblemChapter />
      <WaterFaucetChapter />
      <VideoNarrative />
      <ConsequencesChapter />
      <ScienceChapter />
      <SolutionsChapter />
      <TestimonialsChapter />
      <TrustChapter />
      <CtaChapter />
    </>
  );
}
