"use client";

import type { SellerRecord, WhatsAppNumberRecord } from "@/lib/dashboard/types";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { cn } from "@/lib/utils";

type WhatsAppNumbersListProps = {
  numbers: WhatsAppNumberRecord[];
  sellers: SellerRecord[];
  testingNumberId?: string | null;
  assigningNumberId?: string | null;
  onAssignSeller: (numberId: string, sellerId: string) => void;
  onTestNumber: (numberId: string) => void;
};

function formatDate(value?: string) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("pt-PT");
}

function statusLabel(number: WhatsAppNumberRecord) {
  if (number.status === "active" && number.verified) return "Ativo";
  if (number.status === "inactive") return "Inativo";
  return number.status;
}

export function WhatsAppNumbersList({
  numbers,
  sellers,
  testingNumberId,
  assigningNumberId,
  onAssignSeller,
  onTestNumber,
}: WhatsAppNumbersListProps) {
  if (numbers.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-line bg-white p-8 text-center">
        <p className="text-sm text-ink-muted">Nenhum número conectado ainda.</p>
        <p className="mt-1 text-xs text-ink-muted">
          Conecte o WhatsApp para importar os números da sua conta.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {numbers.map((number) => {
        const currentSeller = number.seller_id
          ? sellers.find((s) => s.id === number.seller_id)
          : null;
        const isTesting = testingNumberId === number.id;
        const isAssigning = assigningNumberId === number.id;
        const missingSeller = number.status === "active" && !number.seller_id;

        return (
          <article
            key={number.id}
            className={cn(
              "rounded-2xl border bg-white p-4 shadow-sm sm:p-5",
              missingSeller ? "border-amber-300" : "border-slate-line",
            )}
          >
            {missingSeller ? (
              <p className="mb-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900">
                Este número ainda não possui vendedor associado.
              </p>
            ) : null}
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-sm text-ink-soft">{number.display_name}</p>
                <p className="text-lg text-ink">{number.phone_number ?? number.phone_number_id ?? "—"}</p>
                <p className="mt-1 text-sm text-ink-muted">
                  Status: <span className="font-medium text-ink">{statusLabel(number)}</span>
                </p>
                <p className="text-xs text-ink-muted">Atualizado: {formatDate(number.updated_at)}</p>
              </div>

              <div className="flex w-full flex-col gap-3 sm:max-w-sm">
                <div>
                  <label htmlFor={`seller-${number.id}`} className="mb-1 block text-xs text-ink-soft">
                    Vendedor
                  </label>
                  <select
                    id={`seller-${number.id}`}
                    className="w-full rounded-xl border border-slate-line bg-ice px-3 py-2 text-sm text-ink outline-none focus:border-azure disabled:opacity-60"
                    value={currentSeller?.id ?? ""}
                    disabled={isAssigning}
                    onChange={(e) => {
                      const sellerId = e.target.value;
                      if (!sellerId) return;
                      onAssignSeller(number.id, sellerId);
                    }}
                  >
                    <option value="">Selecione um vendedor</option>
                    {sellers
                      .filter((s) => s.active)
                      .map((seller) => (
                        <option key={seller.id} value={seller.id}>
                          {seller.name}
                        </option>
                      ))}
                  </select>
                  {isAssigning ? (
                    <p className="mt-1 text-xs text-ink-muted">A guardar associação…</p>
                  ) : null}
                </div>

                <MagneticButton
                  variant="secondary"
                  className="!px-4 !py-2 !text-xs"
                  disabled={isTesting}
                  onClick={() => onTestNumber(number.id)}
                >
                  {isTesting ? "A testar…" : "Testar número"}
                </MagneticButton>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
