import { Router } from "express";
import { z } from "zod";
import { HttpError } from "../../errors/httpError";
import type {
  CompanyBySiteKeyResolver,
  PublicSeller,
  SellersReadRepository,
} from "./publicDeps";

const siteKeyFromHeaderSchema = z
  .string()
  .min(1)
  .transform((s) => s.trim());

export function createPublicSellersRouter(deps: {
  companyResolver: CompanyBySiteKeyResolver;
  sellersRepo: SellersReadRepository;
}) {
  const router = Router();

  router.get("/public/sellers", async (req, res, next) => {
    try {
      const rawSiteKey = req.headers["x-site-key"];
      if (!rawSiteKey || Array.isArray(rawSiteKey)) {
        return next(
          new HttpError({ statusCode: 401, code: "UNAUTHORIZED", message: "Missing x-site-key" }),
        );
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

      const sellers = await deps.sellersRepo.listActiveSellers(companyId);

      const response: PublicSeller[] = sellers.map((s) => ({
        id: s.id,
        name: s.name,
        displayName: s.displayName ?? s.name,
        whatsappAvailable: s.whatsappAvailable,
      }));

      return res.status(200).json(response);
    } catch (err) {
      return next(err);
    }
  });

  return router;
}

