"use client";

import { useLocale } from "next-intl";
import type { EnterpriseProduct } from "@/data/enterprise/types";
import { getEnterpriseProductBySlug } from "@/data/enterprise/products";
import { enterpriseCategoryLabels } from "@/data/enterprise/categories";

interface EnterpriseComparisonProps {
  compareSlugs: string[];
  currentProduct: EnterpriseProduct;
}

export function EnterpriseComparison({
  compareSlugs,
  currentProduct,
}: EnterpriseComparisonProps) {
  const locale = useLocale() as "pt" | "en";
  const compareProducts = compareSlugs
    .map((slug) => getEnterpriseProductBySlug(slug))
    .filter(Boolean) as EnterpriseProduct[];

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
                  {enterpriseCategoryLabels[p.categories[0]][locale]}
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
            {currentProduct.specs.slice(0, 5).map((spec, i) => (
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
