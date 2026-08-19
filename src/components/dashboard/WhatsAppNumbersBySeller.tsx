"use client";

import type { SellerNumberGroup } from "@/lib/dashboard/whatsappMetrics";
import { cn } from "@/lib/utils";

type WhatsAppNumbersBySellerProps = {
  groups: SellerNumberGroup[];
  filterSellerId?: string | null;
};

function formatPhone(number: { phone_number: string | null; phone_number_id?: string | null; display_name: string }) {
  return number.phone_number ?? number.phone_number_id ?? number.display_name;
}

export function WhatsAppNumbersBySeller({ groups, filterSellerId }: WhatsAppNumbersBySellerProps) {
  const visible =
    filterSellerId === undefined
      ? groups
      : groups.filter((g) => g.sellerId === filterSellerId);

  if (visible.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-line bg-white p-8 text-center">
        <p className="text-sm text-ink-muted">Nenhum número ativo para o filtro selecionado.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {visible.map((group) => (
        <article
          key={group.sellerId ?? "unassigned"}
          className={cn(
            "rounded-2xl border bg-white p-5 shadow-sm",
            group.sellerId === null ? "border-amber-300" : "border-slate-line",
          )}
        >
          <h3 className="text-base font-medium text-ink">{group.sellerName}</h3>
          {group.sellerId === null ? (
            <p className="mt-1 text-xs text-amber-800">Associe estes números a um vendedor.</p>
          ) : null}
          <ul className="mt-3 space-y-2">
            {group.numbers.map((number) => (
              <li key={number.id} className="flex items-center justify-between text-sm">
                <span className="text-ink">{formatPhone(number)}</span>
                <span className="text-ink-muted">
                  {number.verified ? "Verificado" : "Não verificado"}
                  {!number.seller_id ? " · sem vendedor" : ""}
                </span>
              </li>
            ))}
          </ul>
        </article>
      ))}
    </div>
  );
}
