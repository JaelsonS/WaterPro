import type { LoggerOptions } from "pino";

export const LOG_REDACT_PATHS = [
  "authorization",
  "cookie",
  "set-cookie",
  "x-api-key",
  "access_token",
  "refresh_token",
  "app_secret",
  "client_secret",
  "password",
  "token",
  "req.headers.authorization",
  'req.headers["authorization"]',
  "req.headers.cookie",
  'req.headers["cookie"]',
  "req.headers.set-cookie",
  'req.headers["set-cookie"]',
  "req.headers.x-api-key",
  'req.headers["x-api-key"]',
  "headers.authorization",
  "headers.cookie",
  "headers.set-cookie",
  "headers.x-api-key",
  "req.query.connectionId",
  "req.query.state",
  "req.query.code",
  "req.query.wabaId",
  "req.query.phoneNumberId",
  "req.query.token",
  "req.query.access_token",
  "req.query.refresh_token",
  "query.connectionId",
  "query.state",
  "query.code",
  "query.wabaId",
  "query.phoneNumberId",
  "*.authorization",
  "*.access_token",
  "*.refresh_token",
  "*.app_secret",
  "*.client_secret",
  "*.password",
  "*.token",
] as const;

const SENSITIVE_QUERY_PARAMS = new Set([
  "connectionid",
  "state",
  "code",
  "wabaid",
  "phonenumberid",
  "access_token",
  "refresh_token",
  "token",
  "app_secret",
  "client_secret",
  "password",
]);

const OAUTH_CALLBACK_SUFFIX = "/whatsapp/connect/callback";

export function sanitizeQueryParams(
  query: Record<string, unknown> | undefined,
  requestPath?: string,
): Record<string, unknown> | undefined {
  if (!query) return query;

  const redactAll = requestPath?.includes(OAUTH_CALLBACK_SUFFIX) ?? false;
  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(query)) {
    if (redactAll || SENSITIVE_QUERY_PARAMS.has(key.toLowerCase())) {
      sanitized[key] = "[REDACTED]";
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

export function sanitizeRequestUrl(url: string): string {
  const qIndex = url.indexOf("?");
  if (qIndex === -1) {
    return url;
  }

  const path = url.slice(0, qIndex);
  const query = url.slice(qIndex + 1);

  if (path.includes(OAUTH_CALLBACK_SUFFIX)) {
    return path;
  }

  const params = new URLSearchParams(query);
  for (const key of [...params.keys()]) {
    if (SENSITIVE_QUERY_PARAMS.has(key.toLowerCase())) {
      params.set(key, "[REDACTED]");
    }
  }

  const sanitizedQuery = params.toString();
  return sanitizedQuery ? `${path}?${sanitizedQuery}` : path;
}

const SENSITIVE_HEADER_NAMES = new Set([
  "authorization",
  "cookie",
  "set-cookie",
  "x-api-key",
]);

export function redactHeaders(headers: Record<string, unknown> | undefined): Record<string, unknown> | undefined {
  if (!headers) return headers;

  const redacted: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(headers)) {
    redacted[key] = SENSITIVE_HEADER_NAMES.has(key.toLowerCase()) ? "[REDACTED]" : value;
  }
  return redacted;
}

export function createLoggerOptions(): LoggerOptions {
  return {
    level: process.env.LOG_LEVEL ?? "info",
    redact: {
      paths: [...LOG_REDACT_PATHS],
      censor: "[REDACTED]",
    },
    transport:
      process.env.NODE_ENV === "production"
        ? undefined
        : {
            target: "pino-pretty",
            options: {
              colorize: true,
              translateTime: "SYS:standard",
            },
          },
  };
}
