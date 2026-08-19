import { Writable } from "node:stream";
import express from "express";
import pino from "pino";
import request from "supertest";
import { afterEach, describe, expect, it } from "vitest";
import { errorHandler } from "../src/middleware/errorHandler";
import { createHttpLogger } from "../src/middleware/httpLogger";
import { HttpError } from "../src/errors/httpError";
import {
  createLoggerOptions,
  redactHeaders,
  sanitizeRequestUrl,
} from "../src/utils/logRedaction";

function createLogCapture() {
  const chunks: string[] = [];
  const stream = new Writable({
    write(chunk, _encoding, callback) {
      chunks.push(chunk.toString());
      callback();
    },
  });
  const options = createLoggerOptions();
  delete options.transport;
  const logger = pino(options, stream);
  return {
    logger,
    getOutput: () => chunks.join(""),
    flush: () => new Promise<void>((resolve) => logger.flush(resolve)),
  };
}

describe("log redaction utilities", () => {
  it("sanitizes OAuth callback URLs by removing query parameters", () => {
    const url =
      "/api/v1/whatsapp/connect/callback?connectionId=11111111-1111-1111-1111-111111111111&state=secret-state&code=oauth-code-xyz&wabaId=waba-123&phoneNumberId=pn-456";

    expect(sanitizeRequestUrl(url)).toBe("/api/v1/whatsapp/connect/callback");
  });

  it("redacts sensitive query params on non-callback URLs", () => {
    const url = "/api/v1/other?token=abc123&state=secret-state&safe=visible";
    expect(sanitizeRequestUrl(url)).toBe("/api/v1/other?token=%5BREDACTED%5D&state=%5BREDACTED%5D&safe=visible");
  });

  it("redacts sensitive headers", () => {
    expect(
      redactHeaders({
        authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test",
        "content-type": "application/json",
        cookie: "session=abc",
      }),
    ).toEqual({
      authorization: "[REDACTED]",
      "content-type": "application/json",
      cookie: "[REDACTED]",
    });
  });
});

describe("HTTP logger security", () => {
  const sensitiveJwt =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U";
  const oauthCode = "mock-oauth-code-7f3a9b2c1d4e5f6a";
  const onboardingState = "onboarding-state-9e8d7c6b5a4f3210";

  it("does not log Authorization bearer tokens", async () => {
    const { logger, getOutput, flush } = createLogCapture();
    const app = express();
    app.use(createHttpLogger(logger));
    app.get("/api/v1/secure", (_req, res) => res.status(200).json({ ok: true }));

    await request(app)
      .get("/api/v1/secure")
      .set("Authorization", `Bearer ${sensitiveJwt}`)
      .set("Cookie", "refresh_token=refresh-secret-value")
      .set("X-API-Key", "app-secret-key-value");

    await flush();
    const output = getOutput();
    expect(output).not.toContain("Bearer ey");
    expect(output).not.toContain(sensitiveJwt);
    expect(output).not.toContain("refresh-secret-value");
    expect(output).not.toContain("app-secret-key-value");
    expect(output).toMatch(/\[REDACTED\]/);
  });

  it("does not log OAuth callback query parameters", async () => {
    const { logger, getOutput, flush } = createLogCapture();
    const app = express();
    app.use(createHttpLogger(logger));
    app.get("/api/v1/whatsapp/connect/callback", (_req, res) =>
      res.status(200).json({ ok: true }),
    );

    const connectionId = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";
    await request(app)
      .get("/api/v1/whatsapp/connect/callback")
      .query({
        connectionId,
        state: onboardingState,
        code: oauthCode,
        wabaId: "waba-sensitive-id",
        phoneNumberId: "phone-sensitive-id",
      })
      .set("Authorization", `Bearer ${sensitiveJwt}`);

    await flush();
    const output = getOutput();
    expect(output).toContain("/api/v1/whatsapp/connect/callback");
    expect(output).not.toContain(connectionId);
    expect(output).not.toContain(onboardingState);
    expect(output).not.toContain(oauthCode);
    expect(output).not.toContain("waba-sensitive-id");
    expect(output).not.toContain("phone-sensitive-id");
    expect(output).not.toContain(sensitiveJwt);
    expect(output).not.toMatch(/connect\/callback\?/);
  });
});

describe("error handler production safety", () => {
  const originalNodeEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
  });

  it("does not expose stack traces to clients when NODE_ENV=production", async () => {
    process.env.NODE_ENV = "production";

    const app = express();
    app.get("/boom", () => {
      throw new Error("internal diagnostic stack detail");
    });
    app.use(errorHandler);

    const res = await request(app).get("/boom");
    expect(res.status).toBe(500);
    expect(res.body.error.message).toBe("Unexpected error");
    expect(res.body.error.stack).toBeUndefined();
    expect(JSON.stringify(res.body)).not.toContain("internal diagnostic stack detail");
  });

  it("returns HttpError status without leaking tenant details", async () => {
    const app = express();
    app.get("/missing", (_req, _res, next) =>
      next(new HttpError({ statusCode: 404, code: "NOT_FOUND", message: "Connection not found" })),
    );
    app.use(errorHandler);

    const res = await request(app).get("/missing");
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("NOT_FOUND");
    expect(res.body.error.message).toBe("Connection not found");
    expect(res.body.error.stack).toBeUndefined();
  });
});
