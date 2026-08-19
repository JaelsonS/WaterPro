import { z } from "zod";

const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  APP_ENV: z.enum(["development", "staging", "production"]).optional(),
  PORT: z.coerce.number().int().positive().optional(),
  LOG_LEVEL: z.string().optional(),

  SUPABASE_URL: z.string().min(1).optional(),
  SUPABASE_ANON_KEY: z.string().min(1).optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),

  OPENAI_API_KEY: z.string().min(1).optional(),

  WHATSAPP_ACCESS_TOKEN: z.string().min(1).optional(),
  WHATSAPP_VERIFY_TOKEN: z.string().min(1).optional(),
  WHATSAPP_APP_SECRET: z.string().min(1).optional(),
  WHATSAPP_PHONE_NUMBER_ID: z.string().min(1).optional(),

  WHATSAPP_PROVIDER: z.string().optional(), // 'mock' | 'meta'

  META_GRAPH_API_VERSION: z.string().min(1).optional(),
  META_APP_ID: z.string().min(1).optional(),
  META_APP_SECRET: z.string().min(1).optional(),
  META_EMBEDDED_SIGNUP_CONFIG_ID: z.string().min(1).optional(),
  WHATSAPP_WEBHOOK_CALLBACK_URL: z.string().min(1).optional(),
  CORS_ALLOWED_ORIGINS: z.string().optional(),
  ADMIN_MFA_REQUIRED: z.string().optional(),
});

export type Env = z.infer<typeof EnvSchema>;

let cachedEnv: Env | null = null;

export function getEnv(): Env {
  if (cachedEnv) return cachedEnv;
  cachedEnv = EnvSchema.parse(process.env);
  return cachedEnv;
}

export function requireSupabaseEnv() {
  const env = getEnv();
  const missing: string[] = [];
  if (!env.SUPABASE_URL) missing.push("SUPABASE_URL");
  if (!env.SUPABASE_ANON_KEY) missing.push("SUPABASE_ANON_KEY");
  if (!env.SUPABASE_SERVICE_ROLE_KEY) missing.push("SUPABASE_SERVICE_ROLE_KEY");

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }

  return env as Env & {
    SUPABASE_URL: string;
    SUPABASE_ANON_KEY: string;
    SUPABASE_SERVICE_ROLE_KEY: string;
  };
}

export function requireSupabaseAnonEnv() {
  const env = getEnv();
  const missing: string[] = [];
  if (!env.SUPABASE_URL) missing.push("SUPABASE_URL");
  if (!env.SUPABASE_ANON_KEY) missing.push("SUPABASE_ANON_KEY");

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }

  return env as Env & {
    SUPABASE_URL: string;
    SUPABASE_ANON_KEY: string;
  };
}

export function requireWhatsAppWebhookEnv() {
  const env = getEnv();
  const missing: string[] = [];
  if (!env.WHATSAPP_VERIFY_TOKEN) missing.push("WHATSAPP_VERIFY_TOKEN");
  if (!env.WHATSAPP_APP_SECRET) missing.push("WHATSAPP_APP_SECRET");

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }

  return env as Env & {
    WHATSAPP_VERIFY_TOKEN: string;
    WHATSAPP_APP_SECRET: string;
  };
}


