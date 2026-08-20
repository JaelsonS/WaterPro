import type { NextFunction, Request, Response } from "express";
import { HttpError } from "../errors/httpError";
import { createSupabaseAdminClient } from "../config/supabase";
import { getBearerToken } from "../utils/auth";

/** Validates JWT only — no company membership required (signup / register). */
export async function authUserMiddleware(req: Request, _res: Response, next: NextFunction) {
  const token = getBearerToken(req);
  if (!token) {
    return next(new HttpError({ statusCode: 401, code: "UNAUTHORIZED", message: "Missing bearer token" }));
  }

  try {
    const admin = createSupabaseAdminClient();
    const { data: userData, error: userError } = await admin.auth.getUser(token);
    if (userError || !userData.user) {
      const detail = userError?.message ? `Invalid token: ${userError.message}` : "Invalid token";
      return next(new HttpError({ statusCode: 401, code: "UNAUTHORIZED", message: detail }));
    }

    req.authUser = { userId: userData.user.id, email: userData.user.email ?? null };
    return next();
  } catch {
    return next(new HttpError({ statusCode: 401, code: "UNAUTHORIZED", message: "Unauthorized" }));
  }
}
