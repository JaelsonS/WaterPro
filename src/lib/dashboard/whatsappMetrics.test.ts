import { describe, expect, it } from "vitest";
import { computeWhatsAppMetrics, groupNumbersBySeller } from "@/lib/dashboard/whatsappMetrics";
import type { SellerRecord, WhatsAppNumberRecord } from "@/lib/dashboard/types";

const numbers: WhatsAppNumberRecord[] = [
  {
    id: "n1",
    seller_id: "s1",
    display_name: "A",
    phone_number: "+351111",
    status: "active",
    verified: true,
  },
  {
    id: "n2",
    seller_id: null,
    display_name: "B",
    phone_number: "+351222",
    status: "active",
    verified: true,
  },
  {
    id: "n3",
    seller_id: "s1",
    display_name: "C",
    phone_number: "+351333",
    status: "inactive",
    verified: false,
  },
];

const sellers: SellerRecord[] = [{ id: "s1", name: "João", active: true }];

describe("whatsappMetrics", () => {
  it("calcula métricas reais a partir dos números", () => {
    const metrics = computeWhatsAppMetrics(numbers);
    expect(metrics.totalNumbers).toBe(3);
    expect(metrics.activeNumbers).toBe(2);
    expect(metrics.withoutSeller).toBe(1);
    expect(metrics.problemNumbers).toBe(1);
  });

  it("agrupa números por vendedor", () => {
    const groups = groupNumbersBySeller(numbers, sellers);
    expect(groups).toHaveLength(2);
    expect(groups.find((g) => g.sellerId === "s1")?.numbers).toHaveLength(1);
    expect(groups.find((g) => g.sellerId === null)?.sellerName).toBe("Sem vendedor");
  });
});
