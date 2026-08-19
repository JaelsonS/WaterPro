import { Router } from "express";
import { z } from "zod";
import { HttpError } from "../../errors/httpError";
import type {
  CompanyBySiteKeyResolver,
  SellersReadRepository,
  WhatsappNumbersReadRepository,
} from "./publicDeps";

const siteKeyFromHeaderSchema = z
  .string()
  .min(1)
  .transform((s) => s.trim());

const sourceSchema = z.enum(["website", "whatsapp", "direct", "campaign"]);

const customerSchema = z
  .object({
    name: z.string().min(1).max(120).optional(),
    phone: z.string().min(3).max(40).optional(),
    city: z.string().min(1).max(60).optional(),
  })
  .strict()
  .optional();

const payloadSchema = z
  .object({
    sellerId: z.string().uuid(),
    source: sourceSchema,
    customer: customerSchema,
  })
  .strict();

function sanitizePhoneToDigits(phone: string) {
  return phone.replace(/[^\d]/g, "");
}

function buildWaMeUrl(phoneDigits: string, text?: string) {
  const base = `https://wa.me/${phoneDigits}`;
  if (!text) return base;
  return `${base}?text=${encodeURIComponent(text)}`;
}

export function createPublicContactRoutingRouter(deps: {
  companyResolver: CompanyBySiteKeyResolver;
  sellersRepo: SellersReadRepository;
  whatsappNumbersRepo: WhatsappNumbersReadRepository;
}) {
  const router = Router();

  router.post("/public/contact-routing", async (req, res, next) => {
    try {
      const rawSiteKey = req.headers["x-site-key"];
      if (!rawSiteKey || Array.isArray(rawSiteKey)) {
        return next(new HttpError({ statusCode: 401, code: "UNAUTHORIZED", message: "Missing x-site-key" }));
      }

      const siteKey = siteKeyFromHeaderSchema.parse(rawSiteKey);
      const companyId = await deps.companyResolver.resolveCompanyIdBySiteKey(siteKey);
      if (!companyId) {
        return next(
          new HttpError({
            statusCode: 404,
            code: "NOT_FOUND",
            message: "Tenant not found",
          }),
        );
      }

      const payload = payloadSchema.parse(req.body);

      const seller = await deps.sellersRepo.getSellerByIdAndCompanyId({
        companyId,
        sellerId: payload.sellerId,
      });

      if (!seller) {
        return next(
          new HttpError({
            statusCode: 404,
            code: "NOT_FOUND",
            message: "Seller not found",
          }),
        );
      }

      if (!seller.active) {
        return next(
          new HttpError({
            statusCode: 400,
            code: "BAD_REQUEST",
            message: "Seller is disabled",
          }),
        );
      }

      const whatsappNumber = await deps.whatsappNumbersRepo.getActiveWhatsappNumberBySellerId({
        companyId,
        sellerId: payload.sellerId,
      });

      if (!whatsappNumber) {
        return next(
          new HttpError({
            statusCode: 400,
            code: "BAD_REQUEST",
            message: "No active WhatsApp number for this seller",
          }),
        );
      }

      // Mensagem inicial: não é "configurável por WaterPro", vem apenas de dados do request
      const customerLine = payload.customer?.name ? `Cliente: ${payload.customer.name}` : undefined;
      const phoneLine = payload.customer?.phone ? `Telefone: ${payload.customer.phone}` : undefined;
      const cityLine = payload.customer?.city ? `Cidade: ${payload.customer.city}` : undefined;

      const textParts = [
        "Olá! Quero falar com um especialista.",
        `Vendedor: ${seller.name}`,
        payload.source ? `Origem: ${payload.source}` : undefined,
        customerLine,
        phoneLine,
        cityLine,
      ].filter((x): x is string => Boolean(x));

      const redirectUrl = buildWaMeUrl(
        sanitizePhoneToDigits(whatsappNumber.phoneNumber),
        textParts.join("\n"),
      );

      return res.status(200).json({
        redirectUrl,
      });
    } catch (err) {
      return next(err);
    }
  });

  return router;
}

