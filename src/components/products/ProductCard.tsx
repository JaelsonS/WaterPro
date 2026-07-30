"use client";

import { SafeImage } from "@/components/ui/SafeImage";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
import type { Product } from "@/data/types";
import { categoryLabels } from "@/data/categories";
import { QuoteButton } from "@/components/ui/QuoteButton";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  className?: string;
}

const benefitIcons = ["✓", "✓", "✓"];

export function ProductCard({ product, className }: ProductCardProps) {
  const locale = useLocale() as "pt" | "en";
  const category = product.categories[0];

  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl glass-panel transition-all duration-500 hover:-translate-y-1 hover:border-azure/20 hover:shadow-[0_20px_60px_rgba(26,127,184,0.12)]",
        className
      )}
    >
      {product.featured && (
        <span className="absolute top-4 left-4 z-10 rounded-full bg-azure/20 px-3 py-1 text-xs font-medium text-azure backdrop-blur-sm">
          {locale === "pt" ? "Destaque" : "Featured"}
        </span>
      )}

      <Link
        href={`/para-sua-casa/${product.slug}`}
        className="relative aspect-square overflow-hidden bg-ice/50"
      >
        <SafeImage
          src={product.images[0]}
          alt={product.name}
          fill
          className="object-contain p-6 transition-transform duration-700 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ice/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </Link>

      <div className="flex flex-1 flex-col p-6">
        <div className="mb-3 flex items-center gap-2">
          <span className="rounded-full bg-azure/10 px-3 py-1 text-xs text-azure">
            {categoryLabels[category][locale]}
          </span>
        </div>

        <Link href={`/para-sua-casa/${product.slug}`}>
          <h3 className="font-[family-name:var(--font-display)] text-xl font-light text-ink transition-colors group-hover:text-azure line-clamp-2">
            {product.name}
          </h3>
        </Link>

        <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-soft line-clamp-3">
          {product.shortDescription}
        </p>

        <p className="mt-4 text-sm font-medium text-azure/80">{product.mainBenefit}</p>

        <ul className="mt-4 flex flex-wrap gap-2">
          {product.benefits.slice(0, 3).map((b, i) => (
            <li key={i} className="flex items-center gap-1 text-xs text-ink-muted">
              <span className="text-azure">{benefitIcons[i]}</span>
              {b.title}
            </li>
          ))}
        </ul>

        <div className="mt-6 flex flex-col gap-3">
          <Link
            href={`/para-sua-casa/${product.slug}`}
            className="flex w-full items-center justify-center rounded-full border border-slate-line py-3 text-sm text-ink-soft transition-all hover:border-azure/30 hover:text-azure"
          >
            {locale === "pt" ? "Ver detalhes" : "View details"}
          </Link>
          <QuoteButton
            productName={product.name}
            productSlug={product.slug}
            productImage={product.images[0]}
            segment="residential"
            variant="price"
          />
        </div>
      </div>
    </article>
  );
}
