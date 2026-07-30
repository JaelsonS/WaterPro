"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { MagneticButton } from "@/components/ui/MagneticButton";

export function ContactForm() {
  const t = useTranslations("contact");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setLoading(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="glass-panel rounded-2xl p-10 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-azure/10">
          <svg className="h-8 w-8 text-azure" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-lg text-ink">{t("success")}</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="glass-panel rounded-2xl p-8 md:p-10"
      aria-label={t("title")}
    >
      <h3 className="mb-8 font-[family-name:var(--font-display)] text-2xl font-light text-ink">
        {t("title")}
      </h3>

      <div className="space-y-5">
        <div>
          <label htmlFor="name" className="mb-2 block text-sm text-ink-soft">
            {t("name")}
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            className="w-full rounded-xl border border-slate-line bg-ice px-4 py-3 text-ink outline-none transition-all duration-300 focus:border-azure/40 focus:shadow-[0_0_20px_rgba(78,205,196,0.1)]"
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="email" className="mb-2 block text-sm text-ink-soft">
              {t("email")}
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full rounded-xl border border-slate-line bg-ice px-4 py-3 text-ink outline-none transition-all duration-300 focus:border-azure/40 focus:shadow-[0_0_20px_rgba(78,205,196,0.1)]"
            />
          </div>
          <div>
            <label htmlFor="phone" className="mb-2 block text-sm text-ink-soft">
              {t("phone")}
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              className="w-full rounded-xl border border-slate-line bg-ice px-4 py-3 text-ink outline-none transition-all duration-300 focus:border-azure/40 focus:shadow-[0_0_20px_rgba(78,205,196,0.1)]"
            />
          </div>
        </div>

        <div>
          <label htmlFor="type" className="mb-2 block text-sm text-ink-soft">
            {t("type")}
          </label>
          <select
            id="type"
            name="type"
            className="w-full rounded-xl border border-slate-line bg-ice px-4 py-3 text-ink outline-none transition-all duration-300 focus:border-azure/40"
          >
            <option value="residential">{t("typeResidential")}</option>
            <option value="commercial">{t("typeCommercial")}</option>
          </select>
        </div>

        <div>
          <label htmlFor="message" className="mb-2 block text-sm text-ink-soft">
            {t("message")}
          </label>
          <textarea
            id="message"
            name="message"
            rows={4}
            className="w-full resize-none rounded-xl border border-slate-line bg-ice px-4 py-3 text-ink outline-none transition-all duration-300 focus:border-azure/40 focus:shadow-[0_0_20px_rgba(78,205,196,0.1)]"
          />
        </div>

        <MagneticButton
          variant="primary"
          className="w-full"
          disabled={loading}
          type="submit"
        >
          {loading ? "..." : t("submit")}
        </MagneticButton>

        <p className="text-xs text-ink-muted">{t("privacy")}</p>
      </div>
    </form>
  );
}
