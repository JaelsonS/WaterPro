import type { NextFunction, Request, Response } from "express";
import { HttpError } from "../errors/httpError";

export function requireCompanyAdmin(req: Request, _res: Response, next: NextFunction) {
  const role = req.user?.role;
  if (role !== "company_admin" && role !== "platform_admin") {
    return next(new HttpError({ statusCode: 403, code: "FORBIDDEN", message: "Admin role required" }));
  }
  return next();
}

