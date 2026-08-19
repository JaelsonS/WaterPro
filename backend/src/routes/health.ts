import { Router } from "express";
import { getEnv } from "../config/env";

export const healthRouter = Router();

function supabaseConfigStatus(env: ReturnType<typeof getEnv>) {
  const url = env.SUPABASE_URL?.trim();
  const anonKey = env.SUPABASE_ANON_KEY?.trim();
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  let urlHost: string | null = null;
  if (url) {
    try {
      urlHost = new URL(url).hostname;
    } catch {
      urlHost = null;
    }
  }

  return {
    configured: Boolean(url && anonKey && serviceKey),
    urlHost,
    hasAnonKey: Boolean(anonKey),
    hasServiceRoleKey: Boolean(serviceKey),
  };
}

healthRouter.get("/health", (_req, res) => {
  const env = getEnv();
  const appEnv = env.APP_ENV ?? env.NODE_ENV;
  const body: Record<string, unknown> = {
    status: "ok",
    environment: appEnv,
    service: "fluxora-api",
  };

  if (appEnv === "staging") {
    body.supabase = supabaseConfigStatus(env);
  }

  res.status(200).json(body);
});

