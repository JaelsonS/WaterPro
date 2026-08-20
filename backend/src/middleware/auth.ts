import type { NextFunction, Request, Response } from "express";
import { HttpError } from "../errors/httpError";
import { createSupabaseAdminClient } from "../config/supabase";
import { getEnv } from "../config/env";
import { getBearerToken } from "../utils/auth";

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const token = getBearerToken(req);
  if (!token) {
    return next(new HttpError({ statusCode: 401, code: "UNAUTHORIZED", message: "Missing bearer token" }));
  }

  try {
    // Validate JWT with service role — more reliable than user-scoped anon client on the server.
    const admin = createSupabaseAdminClient();
    const { data: userData, error: userError } = await admin.auth.getUser(token);
    if (userError || !userData.user) {
      const detail = userError?.message ? `Invalid token: ${userError.message}` : "Invalid token";
      return next(new HttpError({ statusCode: 401, code: "UNAUTHORIZED", message: detail }));
    }

    const userId = userData.user.id;

    const { data: pa } = await admin
      .from("platform_admins")
      .select("user_id")
      .eq("user_id", userId)
      .maybeSingle();

    if (pa) {
      req.user = { userId, role: "platform_admin" };
      return next();
    }

    const { data: membership, error: membershipError } = await admin
      .from("company_members")
      .select("company_id, role")
      .eq("user_id", userId)
      .eq("active", true)
      .limit(1)
      .maybeSingle();

    if (membershipError) {
      throw membershipError;
    }

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
    const message = appEnv === "staging" ? detail : "Unauthorized";
    return next(new HttpError({ statusCode: 401, code: "UNAUTHORIZED", message }));
  }
}
