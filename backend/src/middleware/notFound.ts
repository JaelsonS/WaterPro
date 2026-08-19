import type { NextFunction, Request, Response } from "express";
import { HttpError } from "../errors/httpError";

export function notFoundHandler(req: Request, _res: Response, next: NextFunction) {
  next(
    new HttpError({
      statusCode: 404,
      code: "NOT_FOUND",
      message: `Route not found: ${req.method} ${req.originalUrl}`,
    }),
  );
}

