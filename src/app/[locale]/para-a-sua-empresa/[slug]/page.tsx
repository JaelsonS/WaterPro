import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getAllEnterpriseSlugs,
  getEnterpriseProductBySlug,
} from "@/data/enterprise/products";
import { EnterpriseProductDetail } from "@/components/enterprise/EnterpriseProductDetail";
import { SITE_URL } from "@/lib/config";

type Props = { params: Promise<{ locale: string; slug: string }> };

export function generateStaticParams() {
  const locales = ["pt", "en"];
  return getAllEnterpriseSlugs().flatMap((slug) =>
    locales.map((locale) => ({ locale, slug }))
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const product = getEnterpriseProductBySlug(slug);
  if (!product) return {};

  const url =
    locale === "pt"
      ? `${SITE_URL}/para-a-sua-empresa/${slug}`
      : `${SITE_URL}/${locale}/para-a-sua-empresa/${slug}`;

  return {
    title: `${product.name} | WaterPro Empresas`,
    description: product.shortDescription,
    openGraph: {
      title: product.name,
      description: product.shortDescription,
      url,
      type: "website",
      images: [{ url: product.images[0], alt: product.name }],
    },
    alternates: {
      canonical: url,
      languages: {
        pt: `${SITE_URL}/para-a-sua-empresa/${slug}`,
        en: `${SITE_URL}/en/para-a-sua-empresa/${slug}`,
      },
    },
  };
}

export default async function EnterpriseProductPage({ params }: Props) {
  const { locale, slug } = await params;
  const product = getEnterpriseProductBySlug(slug);

  if (!product) notFound();

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.shortDescription,
    image: product.images,
    brand: { "@type": "Brand", name: "WaterPro" },
    category: product.categories.join(", "),
    audience: { "@type": "BusinessAudience" },
    offers: {
      "@type": "Offer",
      availability: "https://schema.org/InStock",
      priceCurrency: "EUR",
      url:
        locale === "pt"
          ? `${SITE_URL}/para-a-sua-empresa/${slug}`
          : `${SITE_URL}/${locale}/para-a-sua-empresa/${slug}`,
    },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: locale === "pt" ? "Para a Sua Empresa" : "For Your Business",
        item:
          locale === "pt"
            ? `${SITE_URL}/para-a-sua-empresa`
            : `${SITE_URL}/${locale}/para-a-sua-empresa`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: product.name,
        item:
          locale === "pt"
            ? `${SITE_URL}/para-a-sua-empresa/${slug}`
            : `${SITE_URL}/${locale}/para-a-sua-empresa/${slug}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <EnterpriseProductDetail product={product} />
    </>
  );
}
