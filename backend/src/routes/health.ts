import { Router } from "express";
import { getEnv } from "../config/env";

export const healthRouter = Router();

healthRouter.get("/health", (_req, res) => {
  const env = getEnv();
  res.status(200).json({
    status: "ok",
    environment: env.APP_ENV ?? env.NODE_ENV,
    service: "fluxora-api",
  });
});

