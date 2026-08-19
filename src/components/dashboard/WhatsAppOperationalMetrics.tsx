"use client";

import type { WhatsAppOperationalMetrics } from "@/lib/dashboard/whatsappMetrics";

type WhatsAppOperationalMetricsProps = {
  metrics: WhatsAppOperationalMetrics;
};

export function WhatsAppOperationalMetricsCard({ metrics }: WhatsAppOperationalMetricsProps) {
  const items = [
    { label: "Total de números", value: metrics.totalNumbers },
    { label: "Ativos", value: metrics.activeNumbers },
    { label: "Verificados", value: metrics.verifiedNumbers },
    { label: "Com vendedor", value: metrics.withSeller },
    { label: "Sem vendedor", value: metrics.withoutSeller, highlight: metrics.withoutSeller > 0 },
    { label: "Com pendência", value: metrics.problemNumbers, highlight: metrics.problemNumbers > 0 },
  ];

  return (
    <section className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6" aria-label="Métricas operacionais WhatsApp">
      {items.map((item) => (
        <div
          key={item.label}
          className={
            item.highlight
              ? "rounded-xl border border-amber-300 bg-amber-50 p-4"
              : "rounded-xl border border-slate-line bg-white p-4"
          }
        >
          <p className="text-xs uppercase tracking-wide text-ink-muted">{item.label}</p>
          <p className="mt-1 text-2xl font-light text-ink">{item.value}</p>
        </div>
      ))}
    </section>
  );
}
