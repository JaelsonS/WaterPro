"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import type { EnterpriseProduct } from "@/data/enterprise/types";
import { ProductGallery } from "@/components/products/ProductGallery";
import { QuoteButton } from "@/components/ui/QuoteButton";
import { EnterpriseComparison } from "./EnterpriseComparison";
import { EnterpriseProductCard } from "./EnterpriseProductCard";
import {
  enterpriseApplicationLabels,
  enterpriseCategoryLabels,
} from "@/data/enterprise/categories";
import { getEnterpriseProductBySlug } from "@/data/enterprise/products";
import { Link } from "@/i18n/routing";
import { Reveal } from "@/components/ui/Reveal";

interface EnterpriseProductDetailProps {
  product: EnterpriseProduct;
}

export function EnterpriseProductDetail({ product }: EnterpriseProductDetailProps) {
  const locale = useLocale() as "pt" | "en";
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const relatedProducts = product.relatedSlugs
    .map((slug) => getEnterpriseProductBySlug(slug))
    .filter(Boolean) as EnterpriseProduct[];

  return (
    <div className="bg-white">
      <div className="border-b border-slate-line bg-ice/30 py-4">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm text-ink-muted">
            <Link href="/" className="hover:text-azure transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/para-a-sua-empresa" className="hover:text-azure transition-colors">
              {locale === "pt" ? "Para a Sua Empresa" : "For Your Business"}
            </Link>
            <span>/</span>
            <span className="text-ink-soft">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="grid gap-16 lg:grid-cols-2">
          <Reveal>
            <ProductGallery images={product.images} productName={product.name} />
          </Reveal>

          <Reveal delay={0.1}>
            <div>
              <div className="mb-4 flex flex-wrap gap-2">
                {product.categories.slice(0, 3).map((cat) => (
                  <span key={cat} className="rounded-full bg-azure/10 px-3 py-1 text-xs text-azure">
                    {enterpriseCategoryLabels[cat][locale]}
                  </span>
                ))}
              </div>

              <h1 className="font-[family-name:var(--font-display)] text-4xl font-light text-ink md:text-5xl">
                {product.name}
              </h1>

              <p className="mt-6 text-lg leading-relaxed text-ink-soft">
                {product.shortDescription}
              </p>

              <p className="mt-4 text-azure">{product.mainBenefit}</p>

              <div className="mt-8 space-y-4">
                <QuoteButton
                  productName={product.name}
                  productSlug={product.slug}
                  productImage={product.images[0]}
                  segment="enterprise"
                  variant="price"
                />
                <QuoteButton
                  productName={product.name}
                  productSlug={product.slug}
                  productImage={product.images[0]}
                  segment="enterprise"
                  variant="primary"
                  className="w-full"
                />
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                {product.technologies.map((tech) => (
                  <span
                    key={tech}
                    className="rounded-full border border-slate-line px-4 py-2 text-xs text-ink-soft"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>
        </div>

        <Reveal>
          <section className="mt-20" aria-labelledby="applications-title">
            <h2
              id="applications-title"
              className="mb-8 font-[family-name:var(--font-display)] text-3xl font-light text-ink"
            >
              {locale === "pt" ? "Aplicações empresariais" : "Business applications"}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {product.applications.map((app) => (
                <div
                  key={app}
                  className="rounded-2xl border border-white/[0.08] bg-ice p-5 transition-all hover:border-azure/20"
                >
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-azure/10 text-azure">
                    <ApplicationIcon type={app} />
                  </div>
                  <p className="font-medium text-ink">
                    {enterpriseApplicationLabels[app][locale]}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </Reveal>

        <Reveal>
          <section className="mt-20" aria-labelledby="description-title">
            <h2
              id="description-title"
              className="mb-6 font-[family-name:var(--font-display)] text-3xl font-light text-ink"
            >
              {locale === "pt" ? "Descrição" : "Description"}
            </h2>
            <p className="max-w-3xl text-ink-soft leading-relaxed">{product.longDescription}</p>
          </section>
        </Reveal>

        <Reveal>
          <section className="mt-20" aria-labelledby="benefits-title">
            <h2
              id="benefits-title"
              className="mb-8 font-[family-name:var(--font-display)] text-3xl font-light text-ink"
            >
              {locale === "pt"
                ? "Porque escolher este equipamento?"
                : "Why choose this equipment?"}
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {product.benefits.map((benefit, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-white/[0.08] bg-ice p-6 transition-all hover:border-azure/20"
                >
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-azure/10 text-azure">
                    ✓
                  </div>
                  <h3 className="font-medium text-ink">{benefit.title}</h3>
                  <p className="mt-2 text-sm text-ink-soft">{benefit.description}</p>
                </div>
              ))}
            </div>
          </section>
        </Reveal>

        <Reveal>
          <section className="mt-20" aria-labelledby="specs-title">
            <h2
              id="specs-title"
              className="mb-8 font-[family-name:var(--font-display)] text-3xl font-light text-ink"
            >
              {locale === "pt" ? "Especificações técnicas" : "Technical specifications"}
            </h2>
            <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-ice">
              <table className="w-full">
                <tbody>
                  {product.specs.map((spec, i) => (
                    <tr key={i} className="border-b border-slate-line last:border-0">
                      <td className="w-1/3 p-5 text-sm text-ink-muted">{spec.label}</td>
                      <td className="p-5 text-sm text-ink">{spec.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </Reveal>

        <Reveal>
          <section className="mt-20" aria-labelledby="ideal-title">
            <h2
              id="ideal-title"
              className="mb-6 font-[family-name:var(--font-display)] text-3xl font-light text-ink"
            >
              {locale === "pt" ? "Recomendado para" : "Recommended for"}
            </h2>
            <ul className="flex flex-wrap gap-3">
              {product.idealFor.map((item) => (
                <li
                  key={item}
                  className="rounded-full bg-ice px-5 py-2.5 text-sm text-ink-soft"
                >
                  {item}
                </li>
              ))}
            </ul>
          </section>
        </Reveal>

        <Reveal>
          <section className="mt-20" aria-labelledby="certs-title">
            <h2
              id="certs-title"
              className="mb-6 font-[family-name:var(--font-display)] text-3xl font-light text-ink"
            >
              {locale === "pt" ? "Certificações e garantia" : "Certifications & warranty"}
            </h2>
            <div className="flex flex-wrap gap-3">
              {product.certifications.map((cert) => (
                <span
                  key={cert}
                  className="rounded-full border border-slate-line px-4 py-2 text-sm text-ink-soft"
                >
                  {cert}
                </span>
              ))}
              <span className="rounded-full border border-azure/20 bg-azure/5 px-4 py-2 text-sm text-azure">
                {product.warranty}
              </span>
            </div>
          </section>
        </Reveal>

        {product.compareWith && product.compareWith.length > 0 && (
          <Reveal>
            <EnterpriseComparison
              compareSlugs={product.compareWith}
              currentProduct={product}
            />
          </Reveal>
        )}

        <Reveal>
          <section className="mt-20" aria-labelledby="faq-title">
            <h2
              id="faq-title"
              className="mb-8 font-[family-name:var(--font-display)] text-3xl font-light text-ink"
            >
              {locale === "pt" ? "Perguntas frequentes" : "FAQ"}
            </h2>
            <div className="max-w-3xl space-y-3">
              {product.faq.map((item, i) => (
                <div key={i} className="overflow-hidden rounded-xl border border-white/[0.08] bg-ice">
                  <button
                    className="flex w-full items-center justify-between p-6 text-left"
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    aria-expanded={openFaq === i}
                  >
                    <span className="pr-4 font-medium text-ink">{item.question}</span>
                    <svg
                      className={`h-5 w-5 shrink-0 text-azure transition-transform ${openFaq === i ? "rotate-180" : ""}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                      />
                    </svg>
                  </button>
                  <div
                    className={`overflow-hidden transition-all ${openFaq === i ? "max-h-48 opacity-100" : "max-h-0 opacity-0"}`}
                  >
                    <p className="px-6 pb-6 text-sm text-ink-soft">{item.answer}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </Reveal>

        {relatedProducts.length > 0 && (
          <Reveal>
            <section className="mt-20" aria-labelledby="related-title">
              <h2
                id="related-title"
                className="mb-8 font-[family-name:var(--font-display)] text-3xl font-light text-ink"
              >
                {locale === "pt" ? "Equipamentos relacionados" : "Related equipment"}
              </h2>
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                {relatedProducts.slice(0, 4).map((p) => (
                  <EnterpriseProductCard key={p.slug} product={p} />
                ))}
              </div>
            </section>
          </Reveal>
        )}

        <Reveal>
          <div className="mt-20 rounded-3xl border border-white/[0.08] bg-gradient-to-r from-ocean/20 to-cyan/10 p-10 text-center md:p-16">
            <h2 className="font-[family-name:var(--font-display)] text-3xl font-light text-ink">
              {locale === "pt"
                ? "Pronto para elevar o padrão da sua empresa?"
                : "Ready to elevate your business standard?"}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-ink-soft">
              {locale === "pt"
                ? "Solicite um orçamento personalizado e receba a recomendação ideal para o seu negócio."
                : "Request a personalised quote and get the ideal recommendation for your business."}
            </p>
            <div className="mt-8 flex justify-center">
              <QuoteButton
                productName={product.name}
                productSlug={product.slug}
                productImage={product.images[0]}
                segment="enterprise"
                variant="primary"
              />
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
}

function ApplicationIcon({ type }: { type: string }) {
  const paths: Record<string, string> = {
    escritorios: "M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6",
    hoteis: "M3 10h18M5 10V6l7-3 7 3v4M7 14h.01M12 14h.01M17 14h.01",
    restaurantes: "M4 11h16M8 11V5M12 11V3M16 11V5M6 21v-2a2 2 0 012-2h8a2 2 0 012 2v2",
    clinicas: "M12 6v12M6 12h12M12 2a10 10 0 100 20 10 10 0 000-20z",
    ginasios: "M6 12h12M4 8h2M18 8h2M4 16h2M18 16h2",
    escolas: "M12 3L2 8l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
    industria: "M2 20h20M5 20V10l5 4V10l5 4V6l5 4v10",
    comercio: "M3 7h18l-2 12H5L3 7zM16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2",
    "espacos-publicos": "M12 2C8 6 4 8 4 13a8 8 0 1016 0c0-5-4-7-8-11z",
  };

  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={paths[type] || paths.escritorios} />
    </svg>
  );
}
