import { getSupabaseClient } from "@/lib/supabase/getSupabaseClient";

function getJwtExp(token: string): number | null {
  try {
    const payload = JSON.parse(
      atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")),
    ) as { exp?: number };
    return typeof payload.exp === "number" ? payload.exp : null;
  } catch {
    return null;
  }
}

function isTokenExpired(token: string, skewSeconds = 30): boolean {
  const exp = getJwtExp(token);
  if (!exp) return false;
  return Date.now() / 1000 >= exp - skewSeconds;
}

export function isAccessTokenNearExpiry(token: string): boolean {
  return isTokenExpired(token);
}

/** Returns the current access token, refreshing the Supabase session when near expiry. */
export async function getAccessToken(): Promise<string | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData.session?.access_token ?? null;
  if (!token) return null;

  if (!isTokenExpired(token)) return token;

  return refreshAccessToken();
}

export async function refreshAccessToken(): Promise<string | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase.auth.refreshSession();
  if (error || !data.session?.access_token) return null;
  return data.session.access_token;
}
