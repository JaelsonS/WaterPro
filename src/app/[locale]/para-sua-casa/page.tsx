import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ResidentialHero } from "@/components/products/ResidentialHero";
import { ProductCatalog } from "@/components/products/ProductCatalog";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "residential.meta" });

  return {
    title: t("title"),
    description: t("description"),
    openGraph: {
      title: t("title"),
      description: t("description"),
      url: locale === "pt" ? "https://waterpro.pt/para-sua-casa" : `https://waterpro.pt/${locale}/para-sua-casa`,
      type: "website",
    },
    alternates: {
      canonical: locale === "pt" ? "https://waterpro.pt/para-sua-casa" : `https://waterpro.pt/${locale}/para-sua-casa`,
      languages: {
        pt: "https://waterpro.pt/para-sua-casa",
        en: "https://waterpro.pt/en/para-sua-casa",
      },
    },
  };
}

export default async function ParaSuaCasaPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "residential" });

  return (
    <>
      <ResidentialHero />

      <section id="catalogo" className="bg-ice py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="font-[family-name:var(--font-display)] text-4xl font-light text-ink md:text-5xl">
              {t("catalog.title")}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-ink-soft">{t("catalog.subtitle")}</p>
          </div>

          <ProductCatalog />
        </div>
      </section>
    </>
  );
}
