"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import type { Product } from "@/data/types";
import { ProductGallery } from "./ProductGallery";
import { QuoteButton } from "@/components/ui/QuoteButton";
import { ProductComparison } from "./ProductComparison";
import { ProductCard } from "./ProductCard";
import { categoryLabels } from "@/data/categories";
import { getProductBySlug } from "@/data/products";
import { Link } from "@/i18n/routing";
import { Reveal } from "@/components/ui/Reveal";

interface ProductDetailProps {
  product: Product;
}

export function ProductDetail({ product }: ProductDetailProps) {
  const locale = useLocale() as "pt" | "en";
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const relatedProducts = product.relatedSlugs
    .map((slug) => getProductBySlug(slug))
    .filter(Boolean) as Product[];

  return (
    <div className="bg-white">
      <div className="border-b border-slate-line bg-ice/30 py-4">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-ink-muted">
            <Link href="/" className="hover:text-azure transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/para-sua-casa" className="hover:text-azure transition-colors">
              {locale === "pt" ? "Para Sua Casa" : "For Your Home"}
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
                {product.categories.map((cat) => (
                  <span key={cat} className="rounded-full bg-azure/10 px-3 py-1 text-xs text-azure">
                    {categoryLabels[cat][locale]}
                  </span>
                ))}
              </div>

              <h1 className="font-[family-name:var(--font-display)] text-4xl font-semibold text-ink md:text-5xl">
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
                  segment="residential"
                  variant="price"
                />
                <QuoteButton
                  productName={product.name}
                  productSlug={product.slug}
                  productImage={product.images[0]}
                  segment="residential"
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
          <section className="mt-20" aria-labelledby="description-title">
            <h2 id="description-title" className="mb-6 font-[family-name:var(--font-display)] text-3xl font-light text-ink">
              {locale === "pt" ? "Descrição" : "Description"}
            </h2>
            <p className="max-w-3xl text-ink-soft leading-relaxed">{product.longDescription}</p>
          </section>
        </Reveal>

        <Reveal>
          <section className="mt-20" aria-labelledby="benefits-title">
            <h2 id="benefits-title" className="mb-8 font-[family-name:var(--font-display)] text-3xl font-light text-ink">
              {locale === "pt" ? "Porque escolher este equipamento?" : "Why choose this equipment?"}
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {product.benefits.map((benefit, i) => (
                <div key={i} className="glass-panel rounded-2xl p-6 transition-all hover:border-azure/20">
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
            <h2 id="specs-title" className="mb-8 font-[family-name:var(--font-display)] text-3xl font-light text-ink">
              {locale === "pt" ? "Especificações" : "Specifications"}
            </h2>
            <div className="glass-panel overflow-hidden rounded-2xl">
              <table className="w-full">
                <tbody>
                  {product.specs.map((spec, i) => (
                    <tr key={i} className="border-b border-slate-line last:border-0">
                      <td className="p-5 text-sm text-ink-muted w-1/3">{spec.label}</td>
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
            <h2 id="ideal-title" className="mb-6 font-[family-name:var(--font-display)] text-3xl font-light text-ink">
              {locale === "pt" ? "Indicado para" : "Ideal for"}
            </h2>
            <ul className="flex flex-wrap gap-3">
              {product.idealFor.map((item) => (
                <li key={item} className="rounded-full bg-ice px-5 py-2.5 text-sm text-ink-soft">
                  {item}
                </li>
              ))}
            </ul>
          </section>
        </Reveal>

        {product.compareWith && product.compareWith.length > 0 && (
          <Reveal>
            <ProductComparison
              compareSlugs={product.compareWith}
              currentProduct={product}
            />
          </Reveal>
        )}

        <Reveal>
          <section className="mt-20" aria-labelledby="faq-title">
            <h2 id="faq-title" className="mb-8 font-[family-name:var(--font-display)] text-3xl font-light text-ink">
              {locale === "pt" ? "Perguntas frequentes" : "FAQ"}
            </h2>
            <div className="space-y-3 max-w-3xl">
              {product.faq.map((item, i) => (
                <div key={i} className="glass-panel overflow-hidden rounded-xl">
                  <button
                    className="flex w-full items-center justify-between p-6 text-left"
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    aria-expanded={openFaq === i}
                  >
                    <span className="font-medium text-ink pr-4">{item.question}</span>
                    <svg
                      className={`h-5 w-5 shrink-0 text-azure transition-transform ${openFaq === i ? "rotate-180" : ""}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </button>
                  <div className={`overflow-hidden transition-all ${openFaq === i ? "max-h-48 opacity-100" : "max-h-0 opacity-0"}`}>
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
              <h2 id="related-title" className="mb-8 font-[family-name:var(--font-display)] text-3xl font-light text-ink">
                {locale === "pt" ? "Produtos relacionados" : "Related products"}
              </h2>
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                {relatedProducts.slice(0, 4).map((p) => (
                  <ProductCard key={p.slug} product={p} />
                ))}
              </div>
            </section>
          </Reveal>
        )}

        <Reveal>
          <div className="mt-20 rounded-3xl bg-gradient-to-r from-ocean/30 to-cyan/10 p-10 text-center md:p-16">
            <h2 className="font-[family-name:var(--font-display)] text-3xl font-light text-ink">
              {locale === "pt" ? "Pronto para dar o próximo passo?" : "Ready to take the next step?"}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-ink-soft">
              {locale === "pt"
                ? "Solicite um orçamento personalizado e receba informações sobre este equipamento."
                : "Request a personalised quote and receive information about this equipment."}
            </p>
            <div className="mt-8 flex justify-center">
              <QuoteButton
                productName={product.name}
                productSlug={product.slug}
                productImage={product.images[0]}
                segment="residential"
                variant="primary"
              />
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
