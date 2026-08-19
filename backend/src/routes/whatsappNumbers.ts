import { Router } from "express";
import { z } from "zod";
import { authMiddleware } from "../middleware/auth";
import { requireCompanyAdmin } from "../middleware/requireCompanyAdmin";
import { HttpError } from "../errors/httpError";
import { getBearerToken } from "../utils/auth";
import { createSupabaseUserClient } from "../config/supabase";
import { createAuditService } from "../audit/createAuditService";
import { WHATSAPP_AUDIT_EVENTS } from "../audit/auditEventTypes";
import { requireAdminMfa } from "../middleware/requireAdminMfa";

const whatsappNumberIdParamSchema = z.object({
  id: z.string().uuid(),
});

const whatsappNumberCreateSchema = z
  .object({
    sellerId: z.string().uuid(),
    displayName: z.string().min(1).max(160),
    phoneNumber: z.string().min(3).max(40),
    phoneNumberId: z.string().optional(),
    businessAccountId: z.string().optional(),
    accessTokenReference: z.string().optional(),
    status: z.string().min(1).max(60).optional(),
  })
  .strict();

const whatsappNumberUpdateSchema = whatsappNumberCreateSchema
  .partial()
  .extend({ sellerId: whatsappNumberCreateSchema.shape.sellerId.optional() })
  .strict();

export const whatsappNumbersRouter = Router();

whatsappNumbersRouter.get("/whatsapp/numbers", authMiddleware, requireCompanyAdmin, async (req, res, next) => {
  try {
    const token = getBearerToken(req);
    if (!token) return next(new HttpError({ statusCode: 401, code: "UNAUTHORIZED", message: "Missing token" }));

    const companyId = req.user?.companyId;
    if (!companyId) return next(new HttpError({ statusCode: 403, code: "FORBIDDEN", message: "Company context required" }));

    const supabase = createSupabaseUserClient(token);

    const { data, error } = await supabase
      .from("whatsapp_numbers")
      .select(
        "id,company_id,seller_id,display_name,phone_number,phone_number_id,business_account_id,status,verified,created_at,updated_at",
      )
      .eq("company_id", companyId)
      .order("created_at", { ascending: false });

    if (error) throw new HttpError({ statusCode: 500, code: "INTERNAL_ERROR", message: "Failed to load whatsapp numbers" });

    return res.status(200).json({ whatsappNumbers: data });
  } catch (err) {
    return next(err);
  }
});

whatsappNumbersRouter.post("/whatsapp/numbers", authMiddleware, requireCompanyAdmin, requireAdminMfa("step_up"), async (req, res, next) => {
  try {
    const token = getBearerToken(req);
    if (!token) return next(new HttpError({ statusCode: 401, code: "UNAUTHORIZED", message: "Missing token" }));

    const companyId = req.user?.companyId;
    if (!companyId) return next(new HttpError({ statusCode: 403, code: "FORBIDDEN", message: "Company context required" }));

    const body = whatsappNumberCreateSchema.parse(req.body);
    const supabase = createSupabaseUserClient(token);

    // Ownership validation: seller must belong to this company.
    const { data: seller, error: sellerErr } = await supabase
      .from("sellers")
      .select("id,active")
      .eq("company_id", companyId)
      .eq("id", body.sellerId)
      .maybeSingle();

    if (sellerErr) throw new HttpError({ statusCode: 500, code: "INTERNAL_ERROR", message: "Failed to validate seller" });
    if (!seller || seller.active !== true) {
      return next(new HttpError({ statusCode: 404, code: "NOT_FOUND", message: "Seller not found" }));
    }

    const { data, error } = await supabase
      .from("whatsapp_numbers")
      .insert({
        company_id: companyId,
        seller_id: body.sellerId,
        display_name: body.displayName,
        phone_number: body.phoneNumber,
        phone_number_id: body.phoneNumberId ?? null,
        business_account_id: body.businessAccountId ?? null,
        access_token_reference: body.accessTokenReference ?? null,
        status: body.status ?? "active",
      })
      .select(
        "id,company_id,seller_id,display_name,phone_number,phone_number_id,business_account_id,status,verified",
      )
      .single();

    if (error) throw new HttpError({ statusCode: 500, code: "INTERNAL_ERROR", message: "Failed to create whatsapp number" });

    return res.status(201).json({ whatsappNumber: data });
  } catch (err) {
    return next(err);
  }
});

whatsappNumbersRouter.patch("/whatsapp/numbers/:id", authMiddleware, requireCompanyAdmin, requireAdminMfa("step_up"), async (req, res, next) => {
  try {
    const token = getBearerToken(req);
    if (!token) return next(new HttpError({ statusCode: 401, code: "UNAUTHORIZED", message: "Missing token" }));

    const companyId = req.user?.companyId;
    if (!companyId) return next(new HttpError({ statusCode: 403, code: "FORBIDDEN", message: "Company context required" }));

    const params = whatsappNumberIdParamSchema.parse(req.params);
    const body = whatsappNumberUpdateSchema.parse(req.body);
    const supabase = createSupabaseUserClient(token);

    // If sellerId changes, validate ownership.
    if (body.sellerId) {
      const { data: seller, error: sellerErr } = await supabase
        .from("sellers")
        .select("id,active")
        .eq("company_id", companyId)
        .eq("id", body.sellerId)
        .maybeSingle();

      if (sellerErr) throw new HttpError({ statusCode: 500, code: "INTERNAL_ERROR", message: "Failed to validate seller" });
      if (!seller || seller.active !== true) {
        return next(new HttpError({ statusCode: 404, code: "NOT_FOUND", message: "Seller not found" }));
      }
    }

    const updatePayload: Record<string, unknown> = {
      display_name: body.displayName,
      phone_number: body.phoneNumber,
      phone_number_id: body.phoneNumberId,
      business_account_id: body.businessAccountId,
      access_token_reference: body.accessTokenReference,
      status: body.status,
      seller_id: body.sellerId,
    };

    // Remove undefined to avoid accidental overwrites
    Object.keys(updatePayload).forEach((k) => updatePayload[k] === undefined && delete updatePayload[k]);

    const { data, error } = await supabase
      .from("whatsapp_numbers")
      .update(updatePayload)
      .eq("company_id", companyId)
      .eq("id", params.id)
      .select(
        "id,company_id,seller_id,display_name,phone_number,phone_number_id,business_account_id,status,verified",
      )
      .single();

    if (error) throw new HttpError({ statusCode: 500, code: "INTERNAL_ERROR", message: "Failed to update whatsapp number" });
    if (!data) return next(new HttpError({ statusCode: 404, code: "NOT_FOUND", message: "WhatsApp number not found" }));

    if (body.sellerId) {
      void createAuditService().record({
        companyId,
        actorUserId: req.user?.userId,
        eventType: WHATSAPP_AUDIT_EVENTS.NUMBER_ASSIGNED,
        resourceType: "whatsapp_number",
        resourceId: data.id,
        metadata: { sellerId: body.sellerId },
      });
    }

    return res.status(200).json({ whatsappNumber: data });
  } catch (err) {
    return next(err);
  }
});

whatsappNumbersRouter.delete("/whatsapp/numbers/:id", authMiddleware, requireCompanyAdmin, requireAdminMfa("step_up"), async (req, res, next) => {
  try {
    const token = getBearerToken(req);
    if (!token) return next(new HttpError({ statusCode: 401, code: "UNAUTHORIZED", message: "Missing token" }));

    const companyId = req.user?.companyId;
    if (!companyId) return next(new HttpError({ statusCode: 403, code: "FORBIDDEN", message: "Company context required" }));

    const params = whatsappNumberIdParamSchema.parse(req.params);
    const supabase = createSupabaseUserClient(token);

    const { data, error } = await supabase
      .from("whatsapp_numbers")
      .update({ status: "inactive" })
      .eq("company_id", companyId)
      .eq("id", params.id)
      .select("id,company_id,status")
      .single();

    if (error) throw new HttpError({ statusCode: 500, code: "INTERNAL_ERROR", message: "Failed to disable whatsapp number" });
    if (!data) return next(new HttpError({ statusCode: 404, code: "NOT_FOUND", message: "WhatsApp number not found" }));

    return res.status(200).json({ whatsappNumber: data });
  } catch (err) {
    return next(err);
  }
});

// Endpoint de teste seguro (sem credenciais/tokens).
// No futuro pode chamar WhatsAppProvider.getNumberStatus() quando o provider real estiver ativo.
whatsappNumbersRouter.post(
  "/whatsapp/numbers/:id/test",
  authMiddleware,
  requireCompanyAdmin,
  requireAdminMfa("step_up"),
  async (req, res, next) => {
    try {
      const token = getBearerToken(req);
      if (!token) return next(new HttpError({ statusCode: 401, code: "UNAUTHORIZED", message: "Missing token" }));

      const companyId = req.user?.companyId;
      if (!companyId) return next(new HttpError({ statusCode: 403, code: "FORBIDDEN", message: "Company context required" }));

      const params = whatsappNumberIdParamSchema.parse(req.params);
      const supabase = createSupabaseUserClient(token);

      const { data, error } = await supabase
        .from("whatsapp_numbers")
        .select("id,status,verified,phone_number_id,created_at,updated_at")
        .eq("company_id", companyId)
        .eq("id", params.id)
        .maybeSingle();

      if (error) throw new HttpError({ statusCode: 500, code: "INTERNAL_ERROR", message: "Failed to load whatsapp number" });
      if (!data) return next(new HttpError({ statusCode: 404, code: "NOT_FOUND", message: "WhatsApp number not found" }));

      void createAuditService().record({
        companyId,
        actorUserId: req.user?.userId,
        eventType: WHATSAPP_AUDIT_EVENTS.NUMBER_TESTED,
        resourceType: "whatsapp_number",
        resourceId: data.id,
        metadata: { status: data.status, verified: data.verified, mock: true },
      });

      return res.status(200).json({
        whatsappNumberId: data.id,
        status: data.status,
        verified: data.verified,
        ok: true,
      });
    } catch (err) {
      return next(err);
    }
  },
);

