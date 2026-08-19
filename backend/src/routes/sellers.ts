import { Router } from "express";
import { z } from "zod";
import { authMiddleware } from "../middleware/auth";
import { requireCompanyAdmin } from "../middleware/requireCompanyAdmin";
import { HttpError } from "../errors/httpError";
import { getBearerToken } from "../utils/auth";
import { createSupabaseUserClient } from "../config/supabase";

const sellerIdParamSchema = z.object({
  id: z.string().uuid(),
});

const sellerCreateSchema = z
  .object({
    name: z.string().min(1).max(120),
    phone: z.string().min(3).max(40).optional(),
    email: z.string().email().optional(),
    role: z.string().min(1).max(60).optional(),
    active: z.boolean().optional(),
    avatarUrl: z.string().url().optional(),
  })
  .strict();

const sellerUpdateSchema = sellerCreateSchema.partial().strict();

export const sellersRouter = Router();

sellersRouter.get("/sellers", authMiddleware, requireCompanyAdmin, async (req, res, next) => {
  try {
    const token = getBearerToken(req);
    if (!token) return next(new HttpError({ statusCode: 401, code: "UNAUTHORIZED", message: "Missing token" }));

    const companyId = req.user?.companyId;
    if (!companyId) return next(new HttpError({ statusCode: 403, code: "FORBIDDEN", message: "Company context required" }));

    const supabase = createSupabaseUserClient(token);

    const { data, error } = await supabase
      .from("sellers")
      .select("id,company_id,name,phone,email,role,active,avatar_url")
      .eq("company_id", companyId)
      .order("created_at", { ascending: false });

    if (error) throw new HttpError({ statusCode: 500, code: "INTERNAL_ERROR", message: "Failed to load sellers" });

    return res.status(200).json({ sellers: data });
  } catch (err) {
    return next(err);
  }
});

sellersRouter.post("/sellers", authMiddleware, requireCompanyAdmin, async (req, res, next) => {
  try {
    const token = getBearerToken(req);
    if (!token) return next(new HttpError({ statusCode: 401, code: "UNAUTHORIZED", message: "Missing token" }));

    const companyId = req.user?.companyId;
    if (!companyId) return next(new HttpError({ statusCode: 403, code: "FORBIDDEN", message: "Company context required" }));

    const body = sellerCreateSchema.parse(req.body);

    const supabase = createSupabaseUserClient(token);

    const { data, error } = await supabase
      .from("sellers")
      .insert({
        company_id: companyId,
        name: body.name,
        phone: body.phone ?? null,
        email: body.email ?? null,
        role: body.role ?? "sales_rep",
        active: body.active ?? true,
        avatar_url: body.avatarUrl ?? null,
      })
      .select("id,company_id,name,phone,email,role,active,avatar_url")
      .single();

    if (error) throw new HttpError({ statusCode: 500, code: "INTERNAL_ERROR", message: "Failed to create seller" });

    return res.status(201).json({ seller: data });
  } catch (err) {
    return next(err);
  }
});

sellersRouter.get("/sellers/:id", authMiddleware, requireCompanyAdmin, async (req, res, next) => {
  try {
    const token = getBearerToken(req);
    if (!token) return next(new HttpError({ statusCode: 401, code: "UNAUTHORIZED", message: "Missing token" }));

    const companyId = req.user?.companyId;
    if (!companyId) return next(new HttpError({ statusCode: 403, code: "FORBIDDEN", message: "Company context required" }));

    const params = sellerIdParamSchema.parse(req.params);
    const supabase = createSupabaseUserClient(token);

    const { data, error } = await supabase
      .from("sellers")
      .select("id,company_id,name,phone,email,role,active,avatar_url")
      .eq("company_id", companyId)
      .eq("id", params.id)
      .maybeSingle();

    if (error) throw new HttpError({ statusCode: 500, code: "INTERNAL_ERROR", message: "Failed to load seller" });
    if (!data) return next(new HttpError({ statusCode: 404, code: "NOT_FOUND", message: "Seller not found" }));

    return res.status(200).json({ seller: data });
  } catch (err) {
    return next(err);
  }
});

sellersRouter.patch("/sellers/:id", authMiddleware, requireCompanyAdmin, async (req, res, next) => {
  try {
    const token = getBearerToken(req);
    if (!token) return next(new HttpError({ statusCode: 401, code: "UNAUTHORIZED", message: "Missing token" }));

    const companyId = req.user?.companyId;
    if (!companyId) return next(new HttpError({ statusCode: 403, code: "FORBIDDEN", message: "Company context required" }));

    const params = sellerIdParamSchema.parse(req.params);
    const body = sellerUpdateSchema.parse(req.body);

    const supabase = createSupabaseUserClient(token);

    const updatePayload = {
      name: body.name,
      phone: body.phone ?? undefined,
      email: body.email ?? undefined,
      role: body.role ?? undefined,
      active: body.active ?? undefined,
      avatar_url: body.avatarUrl ?? undefined,
    };

    const { data, error } = await supabase
      .from("sellers")
      .update(updatePayload)
      .eq("company_id", companyId)
      .eq("id", params.id)
      .select("id,company_id,name,phone,email,role,active,avatar_url")
      .single();

    if (error) throw new HttpError({ statusCode: 500, code: "INTERNAL_ERROR", message: "Failed to update seller" });
    if (!data) return next(new HttpError({ statusCode: 404, code: "NOT_FOUND", message: "Seller not found" }));

    return res.status(200).json({ seller: data });
  } catch (err) {
    return next(err);
  }
});

sellersRouter.delete("/sellers/:id", authMiddleware, requireCompanyAdmin, async (req, res, next) => {
  try {
    const token = getBearerToken(req);
    if (!token) return next(new HttpError({ statusCode: 401, code: "UNAUTHORIZED", message: "Missing token" }));

    const companyId = req.user?.companyId;
    if (!companyId) return next(new HttpError({ statusCode: 403, code: "FORBIDDEN", message: "Company context required" }));

    const params = sellerIdParamSchema.parse(req.params);
    const supabase = createSupabaseUserClient(token);

    const { data, error } = await supabase
      .from("sellers")
      .update({ active: false })
      .eq("company_id", companyId)
      .eq("id", params.id)
      .select("id,company_id,name,active")
      .single();

    if (error) throw new HttpError({ statusCode: 500, code: "INTERNAL_ERROR", message: "Failed to disable seller" });
    if (!data) return next(new HttpError({ statusCode: 404, code: "NOT_FOUND", message: "Seller not found" }));

    return res.status(200).json({ seller: data });
  } catch (err) {
    return next(err);
  }
});

