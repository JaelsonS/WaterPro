import type { NextFunction, Request, Response } from "express";
import { HttpError } from "../errors/httpError";
import { createSupabaseUserClient } from "../config/supabase";
import { getEnv } from "../config/env";
import { getBearerToken } from "../utils/auth";

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const token = getBearerToken(req);
  if (!token) {
    return next(new HttpError({ statusCode: 401, code: "UNAUTHORIZED", message: "Missing bearer token" }));
  }

  try {
    const supabase = createSupabaseUserClient(token);
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData.user) {
      return next(new HttpError({ statusCode: 401, code: "UNAUTHORIZED", message: "Invalid token" }));
    }

    const userId = userData.user.id;

    // Check platform admin
    const { data: pa } = await supabase
      .from("platform_admins")
      .select("user_id")
      .eq("user_id", userId)
      .maybeSingle();

    if (pa) {
      req.user = { userId, role: "platform_admin" };
      return next();
    }

    // Derive active company_id from membership (tenant isolation)
    const { data: membership } = await supabase
      .from("company_members")
      .select("company_id, role")
      .eq("user_id", userId)
      .eq("active", true)
      .limit(1)
      .maybeSingle();

    if (!membership?.company_id) {
      return next(
        new HttpError({
          statusCode: 403,
          code: "FORBIDDEN",
          message: "No active company membership for this user",
        }),
      );
    }

    req.user = { userId, companyId: membership.company_id, role: membership.role };
    return next();
  } catch (err) {
    const appEnv = getEnv().APP_ENV ?? getEnv().NODE_ENV;
    const detail = err instanceof Error ? err.message : "Unauthorized";
    // Staging: surface config errors to speed up deploy debugging.
    const message = appEnv === "staging" ? detail : "Unauthorized";
    return next(new HttpError({ statusCode: 401, code: "UNAUTHORIZED", message }));
  }
}

