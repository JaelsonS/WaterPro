import type { SellerRecord, WhatsAppNumberRecord } from "./types";

export type WhatsAppOperationalMetrics = {
  totalNumbers: number;
  activeNumbers: number;
  verifiedNumbers: number;
  withSeller: number;
  withoutSeller: number;
  inactiveNumbers: number;
  problemNumbers: number;
};

export function computeWhatsAppMetrics(numbers: WhatsAppNumberRecord[]): WhatsAppOperationalMetrics {
  const active = numbers.filter((n) => n.status === "active");
  const verified = active.filter((n) => n.verified);
  const withSeller = active.filter((n) => Boolean(n.seller_id));
  const withoutSeller = active.filter((n) => !n.seller_id);
  const inactive = numbers.filter((n) => n.status !== "active");
  const problem = active.filter((n) => !n.verified || !n.seller_id);

  return {
    totalNumbers: active.length,
    activeNumbers: active.length,
    verifiedNumbers: verified.length,
    withSeller: withSeller.length,
    withoutSeller: withoutSeller.length,
    inactiveNumbers: inactive.length,
    problemNumbers: problem.length,
  };
}

export type SellerNumberGroup = {
  sellerId: string | null;
  sellerName: string;
  numbers: WhatsAppNumberRecord[];
};

export function groupNumbersBySeller(
  numbers: WhatsAppNumberRecord[],
  sellers: SellerRecord[],
): SellerNumberGroup[] {
  const sellerMap = new Map(sellers.map((s) => [s.id, s.name]));
  const groups = new Map<string | null, WhatsAppNumberRecord[]>();

  for (const number of numbers.filter((n) => n.status === "active")) {
    const key = number.seller_id ?? null;
    const list = groups.get(key) ?? [];
    list.push(number);
    groups.set(key, list);
  }

  const result: SellerNumberGroup[] = [];
  for (const [sellerId, groupNumbers] of groups.entries()) {
    result.push({
      sellerId,
      sellerName: sellerId ? (sellerMap.get(sellerId) ?? "Vendedor desconhecido") : "Sem vendedor",
      numbers: groupNumbers,
    });
  }

  return result.sort((a, b) => {
    if (a.sellerId === null) return 1;
    if (b.sellerId === null) return -1;
    return a.sellerName.localeCompare(b.sellerName, "pt-PT");
  });
}
