import { getSupabaseClient } from "@/lib/supabase/getSupabaseClient";

/** Returns a validated access token, refreshing the Supabase session when needed. */
export async function getAccessToken(): Promise<string | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (!userError && userData.user) {
    const { data: sessionData } = await supabase.auth.getSession();
    return sessionData.session?.access_token ?? null;
  }

  const { data: refreshed, error: refreshError } = await supabase.auth.refreshSession();
  if (refreshError || !refreshed.session?.access_token) return null;

  const { data: retryUser, error: retryError } = await supabase.auth.getUser();
  if (retryError || !retryUser.user) return null;

  return refreshed.session.access_token;
}

export async function refreshAccessToken(): Promise<string | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase.auth.refreshSession();
  if (error || !data.session?.access_token) return null;
  return data.session.access_token;
}
