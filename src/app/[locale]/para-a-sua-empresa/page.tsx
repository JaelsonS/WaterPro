import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { EnterpriseHero } from "@/components/enterprise/EnterpriseHero";
import { EnterpriseCatalog } from "@/components/enterprise/EnterpriseCatalog";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "enterprise.meta" });

  return {
    title: t("title"),
    description: t("description"),
    openGraph: {
      title: t("title"),
      description: t("description"),
      url:
        locale === "pt"
          ? "https://waterpro.pt/para-a-sua-empresa"
          : `https://waterpro.pt/${locale}/para-a-sua-empresa`,
      type: "website",
    },
    alternates: {
      canonical:
        locale === "pt"
          ? "https://waterpro.pt/para-a-sua-empresa"
          : `https://waterpro.pt/${locale}/para-a-sua-empresa`,
      languages: {
        pt: "https://waterpro.pt/para-a-sua-empresa",
        en: "https://waterpro.pt/en/para-a-sua-empresa",
      },
    },
  };
}

export default async function ParaASuaEmpresaPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "enterprise" });

  return (
    <>
      <EnterpriseHero />

      <section id="catalogo" className="bg-ice py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="font-[family-name:var(--font-display)] text-4xl font-light text-ink md:text-5xl">
              {t("catalog.title")}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-ink-soft">{t("catalog.subtitle")}</p>
          </div>

          <EnterpriseCatalog />
        </div>
      </section>
    </>
  );
}
