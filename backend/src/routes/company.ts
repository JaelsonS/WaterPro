import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { getBearerToken } from "../utils/auth";
import { createSupabaseUserClient } from "../config/supabase";
import { HttpError } from "../errors/httpError";

export const companyRouter = Router();

companyRouter.get("/company", authMiddleware, async (req, res, next) => {
  const token = getBearerToken(req);
  if (!token) {
    return next(new HttpError({ statusCode: 401, code: "UNAUTHORIZED", message: "Missing bearer token" }));
  }

  const companyId = req.user?.companyId;
  if (!companyId) {
    return next(new HttpError({ statusCode: 403, code: "FORBIDDEN", message: "Company context required" }));
  }

  const supabase = createSupabaseUserClient(token);

  const { data, error } = await supabase
    .from("companies")
    .select("id, name, slug, status, timezone, created_at, updated_at")
    .eq("id", companyId)
    .single();

  if (error) {
    return next(new HttpError({ statusCode: 500, code: "INTERNAL_ERROR", message: "Failed to load company" }));
  }

  res.status(200).json({ company: data });
});

