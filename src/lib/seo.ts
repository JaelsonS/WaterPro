import type { Locale } from "@/i18n/config";
import {
  COMPANY_ADDRESS,
  COMPANY_DESCRIPTION_EN,
  COMPANY_DESCRIPTION_PT,
  COMPANY_EMAIL,
  COMPANY_NAME,
  COMPANY_PHONE_RAW,
  SITE_URL,
  SOCIAL_LINKS,
} from "./config";

export function getOrganizationSchema(locale: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: COMPANY_NAME,
    alternateName: "WaterPro",
    url: SITE_URL,
    logo: `${SITE_URL}/logo.svg`,
    description: locale === "pt" ? COMPANY_DESCRIPTION_PT : COMPANY_DESCRIPTION_EN,
    contactPoint: {
      "@type": "ContactPoint",
      telephone: COMPANY_PHONE_RAW,
      email: COMPANY_EMAIL,
      contactType: "customer service",
      availableLanguage: ["Portuguese", "English"],
      areaServed: {
        "@type": "Country",
        name: "Portugal",
      },
    },
    sameAs: [
      SOCIAL_LINKS.facebook,
      SOCIAL_LINKS.instagram,
      SOCIAL_LINKS.linkedin,
      SOCIAL_LINKS.youtube,
    ],
    address: {
      "@type": "PostalAddress",
      addressLocality: COMPANY_ADDRESS.city,
      addressRegion: COMPANY_ADDRESS.region,
      addressCountry: "PT",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "5.0",
      reviewCount: "47",
      bestRating: "5",
      worstRating: "1",
    },
  };
}

export function getLocalBusinessSchema(locale: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: COMPANY_NAME,
    image: `${SITE_URL}/og-image.jpg`,
    "@id": SITE_URL,
    url: SITE_URL,
    telephone: COMPANY_PHONE_RAW,
    email: COMPANY_EMAIL,
    priceRange: "€€",
    address: {
      "@type": "PostalAddress",
      addressLocality: COMPANY_ADDRESS.city,
      addressRegion: COMPANY_ADDRESS.region,
      addressCountry: "PT",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "5.0",
      reviewCount: "47",
      bestRating: "5",
      worstRating: "1",
    },
    areaServed: {
      "@type": "Country",
      name: "Portugal",
    },
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "09:00",
      closes: "18:00",
    },
    description: locale === "pt" ? COMPANY_DESCRIPTION_PT : COMPANY_DESCRIPTION_EN,
  };
}

export function getWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: COMPANY_NAME,
    alternateName: "WaterPro",
    url: SITE_URL,
    description: COMPANY_DESCRIPTION_PT,
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/para-sua-casa?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function getFAQSchema(
  items: Array<{ question: string; answer: string }>
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}
