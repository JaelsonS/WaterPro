import type { Session, SupabaseClient } from "@supabase/supabase-js";

export async function consumeAuthHashSession(supabase: SupabaseClient): Promise<Session | null> {
  if (typeof window === "undefined") return null;

  const hash = window.location.hash.replace(/^#/, "");
  if (!hash.includes("access_token=")) return null;

  const params = new URLSearchParams(hash);
  const accessToken = params.get("access_token");
  const refreshToken = params.get("refresh_token");

  if (!accessToken || !refreshToken) return null;

  const { data, error } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  if (error) throw error;

  window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
  return data.session;
}
