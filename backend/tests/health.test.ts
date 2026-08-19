import request from "supertest";
import { describe, expect, it } from "vitest";
import { app } from "../src/app";

describe("GET /api/v1/health", () => {
  it("should return ok status and environment", async () => {
    const res = await request(app).get("/api/v1/health");

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
    expect(res.body.service).toBe("fluxora-api");
    expect(res.body.environment).toBeDefined();
    expect(res.headers["x-request-id"]).toBeDefined();
  });
});

