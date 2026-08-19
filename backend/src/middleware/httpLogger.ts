import { randomUUID } from "crypto";
import type { Request } from "express";
import pinoHttp from "pino-http";
import { stdSerializers } from "pino";
import type { Logger } from "pino";
import { redactHeaders, sanitizeQueryParams, sanitizeRequestUrl } from "../utils/logRedaction";

export function createHttpLogger(logger: Logger) {
  return pinoHttp({
    logger,
    genReqId: (req) => {
      const request = req as Request;
      const existing =
        request.requestId ?? (request.headers["x-request-id"] as string | undefined) ?? undefined;
      return existing ?? randomUUID();
    },
    serializers: {
      req(req) {
        const serialized = stdSerializers.req(req) as {
          method?: string;
          url?: string;
          query?: Record<string, unknown>;
          headers?: Record<string, unknown>;
          remoteAddress?: string;
          remotePort?: number;
        };

        const sanitizedUrl = sanitizeRequestUrl(serialized.url ?? req.url ?? "");

        return {
          ...serialized,
          url: sanitizedUrl,
          query: sanitizeQueryParams(serialized.query ?? (req.query as Record<string, unknown>), sanitizedUrl),
          headers: redactHeaders(serialized.headers),
        };
      },
    },
  });
}
