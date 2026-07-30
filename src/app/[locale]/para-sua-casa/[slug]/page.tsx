import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllProductSlugs, getProductBySlug } from "@/data/products";
import { ProductDetail } from "@/components/products/ProductDetail";
import { SITE_URL } from "@/lib/config";

type Props = { params: Promise<{ locale: string; slug: string }> };

export function generateStaticParams() {
  return getAllProductSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return {};

  const url =
    locale === "pt"
      ? `${SITE_URL}/para-sua-casa/${slug}`
      : `${SITE_URL}/${locale}/para-sua-casa/${slug}`;

  return {
    title: `${product.name} | WaterPro`,
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
        pt: `${SITE_URL}/para-sua-casa/${slug}`,
        en: `${SITE_URL}/en/para-sua-casa/${slug}`,
      },
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { locale, slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) notFound();

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.shortDescription,
    image: product.images,
    brand: { "@type": "Brand", name: "WaterPro" },
    category: product.categories.join(", "),
    offers: {
      "@type": "Offer",
      availability: "https://schema.org/InStock",
      priceCurrency: "EUR",
      url:
        locale === "pt"
          ? `${SITE_URL}/para-sua-casa/${slug}`
          : `${SITE_URL}/${locale}/para-sua-casa/${slug}`,
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
        name: locale === "pt" ? "Para Sua Casa" : "For Your Home",
        item: locale === "pt" ? `${SITE_URL}/para-sua-casa` : `${SITE_URL}/${locale}/para-sua-casa`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: product.name,
        item:
          locale === "pt"
            ? `${SITE_URL}/para-sua-casa/${slug}`
            : `${SITE_URL}/${locale}/para-sua-casa/${slug}`,
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
      <ProductDetail product={product} />
    </>
  );
}
