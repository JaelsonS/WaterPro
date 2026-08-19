import type { NextFunction, Request, Response } from "express";
import { HttpError } from "../errors/httpError";
import { createSupabaseUserClient } from "../config/supabase";
import { getBearerToken } from "../utils/auth";

/** Validates JWT only — no company membership required (signup / register). */
export async function authUserMiddleware(req: Request, _res: Response, next: NextFunction) {
  const token = getBearerToken(req);
  if (!token) {
    return next(new HttpError({ statusCode: 401, code: "UNAUTHORIZED", message: "Missing bearer token" }));
  }

  try {
    const supabase = createSupabaseUserClient(token);
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData.user) {
      return next(new HttpError({ statusCode: 401, code: "UNAUTHORIZED", message: "Email ou senha inválidos" }));
    }

    req.authUser = { userId: userData.user.id, email: userData.user.email ?? null };
    return next();
  } catch {
    return next(new HttpError({ statusCode: 401, code: "UNAUTHORIZED", message: "Email ou senha inválidos" }));
  }
}
