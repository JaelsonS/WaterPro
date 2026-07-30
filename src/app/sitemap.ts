import { MetadataRoute } from "next";
import { getAllEnterpriseSlugs } from "@/data/enterprise/products";
import { getAllProductSlugs } from "@/data/products";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://waterpro.pt";
  const residentialSlugs = getAllProductSlugs();
  const enterpriseSlugs = getAllEnterpriseSlugs();

  const residentialPages: MetadataRoute.Sitemap = residentialSlugs.flatMap((slug) => [
    {
      url: `${baseUrl}/para-sua-casa/${slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
      alternates: {
        languages: {
          pt: `${baseUrl}/para-sua-casa/${slug}`,
          en: `${baseUrl}/en/para-sua-casa/${slug}`,
        },
      },
    },
  ]);

  const enterprisePages: MetadataRoute.Sitemap = enterpriseSlugs.flatMap((slug) => [
    {
      url: `${baseUrl}/para-a-sua-empresa/${slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
      alternates: {
        languages: {
          pt: `${baseUrl}/para-a-sua-empresa/${slug}`,
          en: `${baseUrl}/en/para-a-sua-empresa/${slug}`,
        },
      },
    },
  ]);

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
      alternates: { languages: { pt: baseUrl, en: `${baseUrl}/en` } },
    },
    {
      url: `${baseUrl}/en`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
      alternates: { languages: { pt: baseUrl, en: `${baseUrl}/en` } },
    },
    {
      url: `${baseUrl}/para-sua-casa`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.95,
      alternates: {
        languages: {
          pt: `${baseUrl}/para-sua-casa`,
          en: `${baseUrl}/en/para-sua-casa`,
        },
      },
    },
    {
      url: `${baseUrl}/en/para-sua-casa`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
      alternates: {
        languages: {
          pt: `${baseUrl}/para-sua-casa`,
          en: `${baseUrl}/en/para-sua-casa`,
        },
      },
    },
    {
      url: `${baseUrl}/para-a-sua-empresa`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.95,
      alternates: {
        languages: {
          pt: `${baseUrl}/para-a-sua-empresa`,
          en: `${baseUrl}/en/para-a-sua-empresa`,
        },
      },
    },
    {
      url: `${baseUrl}/sobre`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.85,
      alternates: {
        languages: {
          pt: `${baseUrl}/sobre`,
          en: `${baseUrl}/en/sobre`,
        },
      },
    },
    {
      url: `${baseUrl}/en/para-a-sua-empresa`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
      alternates: {
        languages: {
          pt: `${baseUrl}/para-a-sua-empresa`,
          en: `${baseUrl}/en/para-a-sua-empresa`,
        },
      },
    },
    ...residentialPages,
    ...enterprisePages,
  ];
}
