import { createClient } from "@supabase/supabase-js";
import { requireSupabaseAnonEnv, requireSupabaseEnv } from "./env";

export function createSupabaseAdminClient() {
  const env = requireSupabaseEnv();
  return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });
}

export function createSupabaseUserClient(accessToken: string) {
  const env = requireSupabaseAnonEnv();
  return createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    auth: { persistSession: false },
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });
}

