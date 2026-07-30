import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AboutChapter } from "@/components/chapters/AboutChapter";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about.meta" });

  return {
    title: t("title"),
    description: t("description"),
    openGraph: {
      title: t("title"),
      description: t("description"),
      url: locale === "pt" ? "https://waterpro.pt/sobre" : `https://waterpro.pt/${locale}/sobre`,
      type: "website",
    },
    alternates: {
      canonical: locale === "pt" ? "https://waterpro.pt/sobre" : `https://waterpro.pt/${locale}/sobre`,
      languages: {
        pt: "https://waterpro.pt/sobre",
        en: "https://waterpro.pt/en/sobre",
      },
    },
  };
}

export default function SobrePage() {
  return <AboutChapter />;
}
