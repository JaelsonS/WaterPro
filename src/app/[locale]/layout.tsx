import type { Metadata } from "next";
import { Cormorant_Garamond, Outfit } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import "../globals.css";
import { SmoothScrollProvider } from "@/components/providers/SmoothScrollProvider";
import { ClientEffects } from "@/components/providers/ClientEffects";
import { SiteChrome } from "@/components/layout/SiteChrome";
import {
  getOrganizationSchema,
  getLocalBusinessSchema,
  getWebSiteSchema,
} from "@/lib/seo";
import type { Locale } from "@/i18n/config";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-display",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-body",
  display: "swap",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });

  return {
    title: {
      default: t("title"),
      template: "%s | WaterPro",
    },
    description: t("description"),
    keywords: t("keywords"),
    metadataBase: new URL("https://waterpro.pt"),
    icons: {
      icon: "/logo.svg",
      apple: "/logo.svg",
    },
    openGraph: {
      title: t("title"),
      description: t("description"),
      siteName: "WaterPro",
      locale: locale === "pt" ? "pt_PT" : "en_US",
      type: "website",
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as Locale)) {
    notFound();
  }

  const messages = await getMessages();

  const schemas = [
    getOrganizationSchema(locale as Locale),
    getLocalBusinessSchema(locale as Locale),
    getWebSiteSchema(),
  ];

  return (
    <html lang={locale} className={`${cormorant.variable} ${outfit.variable}`} suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/logo.svg" type="image/svg+xml" />
      </head>
      <body className="font-[family-name:var(--font-body)]" suppressHydrationWarning>
        <NextIntlClientProvider messages={messages}>
          <SmoothScrollProvider>
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-lg focus:bg-azure focus:px-4 focus:py-2 focus:text-abyss"
            >
              Skip to content
            </a>

            {schemas.map((schema, i) => (
              <script
                key={i}
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
              />
            ))}

            <ClientEffects />
            <SiteChrome>{children}</SiteChrome>
          </SmoothScrollProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
