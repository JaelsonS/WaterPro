import express from "express";
import request from "supertest";
import { describe, expect, it } from "vitest";
import { errorHandler } from "../src/middleware/errorHandler";
import { notFoundHandler } from "../src/middleware/notFound";
import { requestIdMiddleware } from "../src/middleware/requestId";
import { createPublicContactRoutingRouter } from "../src/routes/public/publicContactRoutingRouter";
import { createPublicSellersRouter } from "../src/routes/public/publicSellersRouter";
import type {
  CompanyBySiteKeyResolver,
  SellersReadRepository,
  WhatsappNumbersReadRepository,
} from "../src/routes/public/publicDeps";

const siteKeyA = "site_key_tenant_a";
const siteKeyB = "site_key_tenant_b";

const companyIdA = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";
const companyIdB = "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb";

const sellerA1 = "11111111-1111-1111-1111-111111111111";
const sellerA2 = "22222222-2222-2222-2222-222222222222"; // disabled
const sellerB1 = "33333333-3333-3333-3333-333333333333";

const whatsappA1 = "aaaaaaaa-0000-0000-0000-aaaaaaaa0000";
const whatsappB1 = "bbbbbbbb-0000-0000-0000-bbbbbbbb0000";
const whatsappCrossCompanyForSellerA1 = "cccccccc-0000-0000-0000-cccccccc0000";

function buildTestApp(deps: {
  companyResolver: CompanyBySiteKeyResolver;
  sellersRepo: SellersReadRepository;
  whatsappNumbersRepo: WhatsappNumbersReadRepository;
}) {
  const app = express();
  app.use(requestIdMiddleware);
  app.use(express.json({ limit: "1mb" }));

  app.use(
    "/api/v1",
    createPublicSellersRouter({
      companyResolver: deps.companyResolver,
      sellersRepo: deps.sellersRepo,
    }),
  );
  app.use(
    "/api/v1",
    createPublicContactRoutingRouter({
      companyResolver: deps.companyResolver,
      sellersRepo: deps.sellersRepo,
      whatsappNumbersRepo: deps.whatsappNumbersRepo,
    }),
  );
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

describe("FASE 1 - Public endpoints (multi-tenant + IDOR)", () => {
  it("Tenant isolation: GET public sellers retorna somente vendedores do tenant", async () => {
    const sellers = [
      { id: sellerA1, companyId: companyIdA, name: "Vendedor A1", active: true },
      { id: sellerA2, companyId: companyIdA, name: "Vendedor A2", active: false },
      { id: sellerB1, companyId: companyIdB, name: "Vendedor B1", active: true },
    ];

    const whatsappNumbers = [
      { id: whatsappA1, companyId: companyIdA, sellerId: sellerA1, phoneNumber: "351910000001", phoneNumberId: null, status: "active" },
      { id: whatsappB1, companyId: companyIdB, sellerId: sellerB1, phoneNumber: "351910000002", phoneNumberId: null, status: "active" },
    ];

    const companyResolver: CompanyBySiteKeyResolver = {
      async resolveCompanyIdBySiteKey(siteKey) {
        if (siteKey === siteKeyA) return companyIdA;
        if (siteKey === siteKeyB) return companyIdB;
        return null;
      },
    };

    const sellersRepo: SellersReadRepository = {
      async listActiveSellers(companyId) {
        const activeSellers = sellers.filter((s) => s.companyId === companyId && s.active);
        return activeSellers.map((s) => ({
          id: s.id,
          name: s.name,
          active: s.active,
          displayName: `${s.name} — Consultor`,
          whatsappAvailable: whatsappNumbers.some((w) => w.companyId === companyId && w.sellerId === s.id && w.status === "active"),
        }));
      },
      async getSellerByIdAndCompanyId({ companyId, sellerId }) {
        const seller = sellers.find((s) => s.companyId === companyId && s.id === sellerId);
        return seller ? { ...seller } : null;
      },
    };

    const whatsappNumbersRepo: WhatsappNumbersReadRepository = {
      async getActiveWhatsappNumberBySellerId({ companyId, sellerId }) {
        const wa = whatsappNumbers.find(
          (w) => w.companyId === companyId && w.sellerId === sellerId && w.status === "active",
        );
        return wa ? { ...wa } : null;
      },
    };

    const appA = buildTestApp({ companyResolver, sellersRepo, whatsappNumbersRepo });

    const resA = await request(appA).get("/api/v1/public/sellers").set("x-site-key", siteKeyA);
    expect(resA.status).toBe(200);
    expect(resA.body).toHaveLength(1);
    expect(resA.body[0].id).toBe(sellerA1);

    const resB = await request(appA).get("/api/v1/public/sellers").set("x-site-key", siteKeyB);
    expect(resB.status).toBe(200);
    expect(resB.body).toHaveLength(1);
    expect(resB.body[0].id).toBe(sellerB1);
  });

  it("Unauthorized: sem x-site-key deve falhar", async () => {
    const companyResolver: CompanyBySiteKeyResolver = {
      async resolveCompanyIdBySiteKey() {
        return companyIdA;
      },
    };

    const sellersRepo = {} as SellersReadRepository;
    const whatsappNumbersRepo = {} as WhatsappNumbersReadRepository;
    const app = buildTestApp({ companyResolver, sellersRepo, whatsappNumbersRepo });

    const res = await request(app).post("/api/v1/public/contact-routing").send({
      sellerId: sellerA1,
      source: "website",
      customer: { name: "Ana" },
    });

    expect(res.status).toBe(401);
  });

  it("Seller inexistente: sellerId não pertence ao tenant deve falhar", async () => {
    const sellers = [
      { id: sellerA1, companyId: companyIdA, name: "Vendedor A1", active: true },
      { id: sellerB1, companyId: companyIdB, name: "Vendedor B1", active: true },
    ];

    const whatsappNumbers = [
      { id: whatsappA1, companyId: companyIdA, sellerId: sellerA1, phoneNumber: "351910000001", phoneNumberId: null, status: "active" },
      { id: whatsappB1, companyId: companyIdB, sellerId: sellerB1, phoneNumber: "351910000002", phoneNumberId: null, status: "active" },
    ];

    const companyResolver: CompanyBySiteKeyResolver = {
      async resolveCompanyIdBySiteKey(siteKey) {
        if (siteKey === siteKeyA) return companyIdA;
        if (siteKey === siteKeyB) return companyIdB;
        return null;
      },
    };

    const sellersRepo: SellersReadRepository = {
      async listActiveSellers() {
        return [];
      },
      async getSellerByIdAndCompanyId({ companyId, sellerId }) {
        const seller = sellers.find((s) => s.companyId === companyId && s.id === sellerId);
        return seller ? { ...seller } : null;
      },
    };

    const whatsappNumbersRepo: WhatsappNumbersReadRepository = {
      async getActiveWhatsappNumberBySellerId() {
        return null;
      },
    };

    const app = buildTestApp({ companyResolver, sellersRepo, whatsappNumbersRepo });

    const res = await request(app)
      .post("/api/v1/public/contact-routing")
      .set("x-site-key", siteKeyA)
      .send({ sellerId: sellerB1, source: "website" }); // seller de outra empresa

    expect(res.status).toBe(404);
  });

  it("Seller desativado: seller.active=false deve falhar", async () => {
    const sellers = [
      { id: sellerA2, companyId: companyIdA, name: "Vendedor A2", active: false },
    ];
    const whatsappNumbers = [];

    const companyResolver: CompanyBySiteKeyResolver = {
      async resolveCompanyIdBySiteKey(siteKey) {
        if (siteKey === siteKeyA) return companyIdA;
        return null;
      },
    };

    const sellersRepo: SellersReadRepository = {
      async listActiveSellers() {
        return [];
      },
      async getSellerByIdAndCompanyId({ companyId, sellerId }) {
        const seller = sellers.find((s) => s.companyId === companyId && s.id === sellerId);
        return seller ? { ...seller } : null;
      },
    };

    const whatsappNumbersRepo: WhatsappNumbersReadRepository = {
      async getActiveWhatsappNumberBySellerId() {
        return null;
      },
    };

    const app = buildTestApp({ companyResolver, sellersRepo, whatsappNumbersRepo });

    const res = await request(app)
      .post("/api/v1/public/contact-routing")
      .set("x-site-key", siteKeyA)
      .send({ sellerId: sellerA2, source: "website", customer: { name: "João" } });

    expect(res.status).toBe(400);
  });

  it("WhatsApp number ownership: número ativo de outra empresa deve falhar", async () => {
    const sellers = [{ id: sellerA1, companyId: companyIdA, name: "Vendedor A1", active: true }];
    const whatsappNumbers = [
      // propositalmente "cross company": sellerId existe no tenant A, mas o número está marcado com companyId B.
      { id: whatsappCrossCompanyForSellerA1, companyId: companyIdB, sellerId: sellerA1, phoneNumber: "351910000099", phoneNumberId: null, status: "active" },
    ];

    const companyResolver: CompanyBySiteKeyResolver = {
      async resolveCompanyIdBySiteKey(siteKey) {
        if (siteKey === siteKeyA) return companyIdA;
        if (siteKey === siteKeyB) return companyIdB;
        return null;
      },
    };

    const sellersRepo: SellersReadRepository = {
      async listActiveSellers() {
        return [];
      },
      async getSellerByIdAndCompanyId({ companyId, sellerId }) {
        const seller = sellers.find((s) => s.companyId === companyId && s.id === sellerId);
        return seller ? { ...seller } : null;
      },
    };

    const whatsappNumbersRepo: WhatsappNumbersReadRepository = {
      async getActiveWhatsappNumberBySellerId({ companyId, sellerId }) {
        const wa = whatsappNumbers.find((w) => w.companyId === companyId && w.sellerId === sellerId && w.status === "active");
        return wa ? { ...wa } : null;
      },
    };

    const app = buildTestApp({ companyResolver, sellersRepo, whatsappNumbersRepo });

    const res = await request(app)
      .post("/api/v1/public/contact-routing")
      .set("x-site-key", siteKeyA)
      .send({
        sellerId: sellerA1,
        source: "website",
        customer: { name: "Ana", phone: "+351 900 000 000", city: "Leiria" },
      });

    expect(res.status).toBe(400);
  });

  it("Happy path: contact-routing retorna URL wa.me do número do tenant correto", async () => {
    const sellers = [{ id: sellerA1, companyId: companyIdA, name: "Vendedor A1", active: true }];
    const whatsappNumbers = [
      { id: whatsappA1, companyId: companyIdA, sellerId: sellerA1, phoneNumber: "351910000001", phoneNumberId: null, status: "active" },
    ];

    const companyResolver: CompanyBySiteKeyResolver = {
      async resolveCompanyIdBySiteKey(siteKey) {
        if (siteKey === siteKeyA) return companyIdA;
        return null;
      },
    };

    const sellersRepo: SellersReadRepository = {
      async listActiveSellers() {
        return [];
      },
      async getSellerByIdAndCompanyId({ companyId, sellerId }) {
        const seller = sellers.find((s) => s.companyId === companyId && s.id === sellerId);
        return seller ? { ...seller } : null;
      },
    };

    const whatsappNumbersRepo: WhatsappNumbersReadRepository = {
      async getActiveWhatsappNumberBySellerId({ companyId, sellerId }) {
        const wa = whatsappNumbers.find((w) => w.companyId === companyId && w.sellerId === sellerId && w.status === "active");
        return wa ? { ...wa } : null;
      },
    };

    const app = buildTestApp({ companyResolver, sellersRepo, whatsappNumbersRepo });

    const res = await request(app)
      .post("/api/v1/public/contact-routing")
      .set("x-site-key", siteKeyA)
      .send({ sellerId: sellerA1, source: "website" });

    expect(res.status).toBe(200);
    expect(res.body.redirectUrl).toContain("https://wa.me/351910000001");
  });
});

