"use client";

import { useLocale } from "next-intl";
import { buildEnterpriseWhatsAppUrl, buildWhatsAppUrl } from "@/lib/config";
import { cn } from "@/lib/utils";

export type QuoteSegment = "residential" | "enterprise";

interface QuoteButtonProps {
  productName: string;
  productSlug: string;
  productImage?: string;
  segment?: QuoteSegment;
  variant?: "price" | "primary";
  className?: string;
}

export function QuoteButton({
  productName,
  productSlug,
  productImage,
  segment = "residential",
  variant = "price",
  className,
}: QuoteButtonProps) {
  const locale = useLocale() as "pt" | "en";

  const basePath =
    segment === "enterprise" ? "para-a-sua-empresa" : "para-sua-casa";
  const productUrl =
    locale === "pt"
      ? `https://waterpro.pt/${basePath}/${productSlug}`
      : `https://waterpro.pt/${locale}/${basePath}/${productSlug}`;

  const href =
    segment === "enterprise"
      ? buildEnterpriseWhatsAppUrl({
          productName,
          productUrl,
          productImage,
          locale,
        })
      : buildWhatsAppUrl({
          productName,
          productUrl,
          productImage,
          locale,
        });

  const labels = {
    pt: { price: "Consultar Preço", hint: "Preço sob consulta" },
    en: { price: "Request Quote", hint: "Price on request" },
  };

  if (variant === "primary") {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "group inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-azure to-cyan px-8 py-4 text-sm font-medium tracking-wide text-abyss transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_40px_rgba(78,205,196,0.25)]",
          className
        )}
      >
        {labels[locale].price}
        <ArrowIcon className="transition-transform group-hover:translate-x-0.5" />
      </a>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "group relative flex w-full items-center justify-between overflow-hidden rounded-2xl border border-slate-line bg-ice px-6 py-5 transition-all duration-300 hover:border-azure/30 hover:bg-white/[0.06] hover:shadow-[0_12px_40px_rgba(26,127,184,0.12)]",
        className
      )}
    >
      <div>
        <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-ink-muted">
          {labels[locale].hint}
        </p>
        <p className="mt-1 text-base font-medium text-ink transition-colors group-hover:text-azure">
          {labels[locale].price}
        </p>
      </div>
      <span className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-line bg-ice text-ink-soft transition-all duration-300 group-hover:border-azure/30 group-hover:bg-azure/10 group-hover:text-azure">
        <ArrowIcon />
      </span>
    </a>
  );
}

function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn("h-4 w-4", className)}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
    </svg>
  );
}
