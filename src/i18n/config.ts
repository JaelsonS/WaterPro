export const locales = ["pt", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "pt";

export const localeNames: Record<Locale, string> = {
  pt: "PT",
  en: "EN",
};
