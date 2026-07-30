"use client";

import { useMemo, useState } from "react";
import { useLocale } from "next-intl";
import type { Product, ProductApplication, ProductCategory } from "@/data/types";
import { allApplications, allCategories, applicationLabels, categoryLabels } from "@/data/categories";
import { filterProducts } from "@/data/products";
import { ProductCard } from "./ProductCard";
import { cn } from "@/lib/utils";

export function ProductCatalog() {
  const locale = useLocale() as "pt" | "en";
  const [category, setCategory] = useState<ProductCategory | "all">("all");
  const [application, setApplication] = useState<ProductApplication | "all">("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"name" | "featured">("featured");

  const filtered = useMemo(
    () => filterProducts({ category, application, search, sort }),
    [category, application, search, sort]
  );

  return (
    <div>
      <div className="mb-8">
        <div className="relative">
          <svg
            className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-muted"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={locale === "pt" ? "Pesquisar produtos..." : "Search products..."}
            className="w-full rounded-2xl border border-slate-line bg-ice py-4 pl-12 pr-4 text-ink outline-none transition-all focus:border-azure/40 focus:shadow-[0_0_20px_rgba(78,205,196,0.1)]"
            aria-label={locale === "pt" ? "Pesquisar produtos" : "Search products"}
          />
        </div>
      </div>

      <div className="mb-8 flex flex-wrap items-center gap-3">
        <button
          onClick={() => setCategory("all")}
          className={cn(
            "rounded-full px-5 py-2.5 text-sm transition-all duration-300",
            category === "all"
              ? "bg-azure text-white"
              : "border border-slate-line text-ink-soft hover:border-azure/30 hover:text-azure"
          )}
        >
          {locale === "pt" ? "Todos" : "All"}
        </button>
        {allCategories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={cn(
              "rounded-full px-5 py-2.5 text-sm transition-all duration-300",
              category === cat
                ? "bg-azure text-white"
                : "border border-slate-line text-ink-soft hover:border-azure/30 hover:text-azure"
            )}
          >
            {categoryLabels[cat][locale]}
          </button>
        ))}
      </div>

      <div className="mb-8 flex flex-wrap items-center gap-2">
        <span className="mr-2 text-xs uppercase tracking-widest text-ink-muted">
          {locale === "pt" ? "Aplicação" : "Application"}
        </span>
        <button
          onClick={() => setApplication("all")}
          className={cn(
            "rounded-full px-4 py-2 text-xs transition-all duration-300",
            application === "all"
              ? "bg-sky text-ink"
              : "border border-slate-line text-ink-muted hover:border-slate-line hover:text-ink-soft"
          )}
        >
          {locale === "pt" ? "Todas" : "All"}
        </button>
        {allApplications.map((app) => (
          <button
            key={app}
            onClick={() => setApplication(app)}
            className={cn(
              "rounded-full px-4 py-2 text-xs transition-all duration-300",
              application === app
                ? "bg-sky text-ink"
                : "border border-slate-line text-ink-muted hover:border-slate-line hover:text-ink-soft"
            )}
          >
            {applicationLabels[app][locale]}
          </button>
        ))}
      </div>

      <div className="mb-8 flex items-center justify-between">
        <p className="text-sm text-ink-muted">
          {filtered.length} {locale === "pt" ? "produtos encontrados" : "products found"}
        </p>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as "name" | "featured")}
          className="rounded-xl border border-slate-line bg-ice px-4 py-2 text-sm text-ink-soft outline-none focus:border-azure/40"
          aria-label={locale === "pt" ? "Ordenar produtos" : "Sort products"}
        >
          <option value="featured">{locale === "pt" ? "Destaques" : "Featured"}</option>
          <option value="name">{locale === "pt" ? "Nome A-Z" : "Name A-Z"}</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-ink-muted">
            {locale === "pt" ? "Nenhum produto encontrado." : "No products found."}
          </p>
        </div>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((product: Product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
