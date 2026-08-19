import { Router } from "express";
import { z } from "zod";
import { authMiddleware } from "../middleware/auth";
import { requireCompanyAdmin } from "../middleware/requireCompanyAdmin";
import { HttpError } from "../errors/httpError";
import { getBearerToken } from "../utils/auth";
import { createSupabaseUserClient } from "../config/supabase";
import { requireAdminMfa } from "../middleware/requireAdminMfa";

export const auditEventsRouter = Router();

auditEventsRouter.get("/audit/events", authMiddleware, requireCompanyAdmin, requireAdminMfa("enrollment"), async (req, res, next) => {
  try {
    const token = getBearerToken(req);
    if (!token) return next(new HttpError({ statusCode: 401, code: "UNAUTHORIZED", message: "Missing token" }));

    const companyId = req.user?.companyId;
    if (!companyId) return next(new HttpError({ statusCode: 403, code: "FORBIDDEN", message: "Company context required" }));

    const limit = z
      .object({ limit: z.coerce.number().int().min(1).max(100).optional() })
      .parse(req.query).limit ?? 50;

    const supabase = createSupabaseUserClient(token);
    const { data, error } = await supabase
      .from("audit_events")
      .select("id,company_id,actor_user_id,event_type,resource_type,resource_id,metadata,created_at")
      .eq("company_id", companyId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      throw new HttpError({ statusCode: 500, code: "INTERNAL_ERROR", message: "Failed to load audit events" });
    }

    return res.status(200).json({ events: data ?? [] });
  } catch (err) {
    return next(err);
  }
});
