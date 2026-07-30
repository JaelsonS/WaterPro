"use client";

import { useLocale } from "next-intl";
import type { Product } from "@/data/types";
import { getProductBySlug } from "@/data/products";
import { categoryLabels } from "@/data/categories";

interface ProductComparisonProps {
  compareSlugs: string[];
  currentProduct: Product;
}

export function ProductComparison({ compareSlugs, currentProduct }: ProductComparisonProps) {
  const locale = useLocale() as "pt" | "en";
  const compareProducts = compareSlugs
    .map((slug) => getProductBySlug(slug))
    .filter(Boolean) as Product[];

  if (compareProducts.length === 0) return null;

  const allProducts = [currentProduct, ...compareProducts];

  return (
    <section className="mt-20" aria-labelledby="comparison-title">
      <h2
        id="comparison-title"
        className="mb-8 font-[family-name:var(--font-display)] text-3xl font-light text-ink"
      >
        {locale === "pt" ? "Comparação" : "Comparison"}
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px] border-collapse">
          <thead>
            <tr>
              <th className="p-4 text-left text-sm text-ink-muted" />
              {allProducts.map((p) => (
                <th key={p.slug} className="p-4 text-left">
                  <span className="font-[family-name:var(--font-display)] text-lg text-ink">
                    {p.name}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-slate-line">
              <td className="p-4 text-sm text-ink-muted">
                {locale === "pt" ? "Categoria" : "Category"}
              </td>
              {allProducts.map((p) => (
                <td key={p.slug} className="p-4 text-sm text-ink-soft">
                  {categoryLabels[p.categories[0]][locale]}
                </td>
              ))}
            </tr>
            <tr className="border-t border-slate-line">
              <td className="p-4 text-sm text-ink-muted">
                {locale === "pt" ? "Benefício principal" : "Main benefit"}
              </td>
              {allProducts.map((p) => (
                <td key={p.slug} className="p-4 text-sm text-ink-soft">
                  {p.mainBenefit}
                </td>
              ))}
            </tr>
            {currentProduct.specs.slice(0, 4).map((spec, i) => (
              <tr key={i} className="border-t border-slate-line">
                <td className="p-4 text-sm text-ink-muted">{spec.label}</td>
                {allProducts.map((p) => (
                  <td key={p.slug} className="p-4 text-sm text-ink-soft">
                    {p.specs[i]?.value || "—"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
