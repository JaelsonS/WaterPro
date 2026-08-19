import { ZodError } from "zod";
import { HttpError } from "../errors/httpError";
import { logger } from "../utils/logger";
import type { Request, Response, NextFunction } from "express";

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  const requestId = _req.requestId;

  if (err instanceof ZodError) {
    logger.warn({ requestId, issues: err.issues }, "zod validation failed");
    return res.status(400).json({
      error: {
        code: "BAD_REQUEST",
        message: "Invalid request",
      },
      requestId,
    });
  }

  if (err instanceof HttpError) {
    logger.warn({ requestId, code: err.code }, "http error");
    return res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
      },
      requestId,
    });
  }

  logger.error({ requestId, err: serializeErrorForLog(err) }, "unhandled error");

  const body: {
    error: { code: string; message: string; stack?: string };
    requestId?: string;
  } = {
    error: {
      code: "INTERNAL_ERROR",
      message: "Unexpected error",
    },
    requestId,
  };

  if (process.env.NODE_ENV !== "production" && err instanceof Error) {
    body.error.stack = err.stack;
  }

  return res.status(500).json(body);
}

function serializeErrorForLog(err: unknown) {
  if (!(err instanceof Error)) return err;
  return {
    name: err.name,
    message: err.message,
    stack: err.stack,
  };
}

