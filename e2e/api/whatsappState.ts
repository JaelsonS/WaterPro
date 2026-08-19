import type { Page } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import { getE2ECredentials, getSessionTokenFromPage } from "../helpers";

const BACKEND_URL = process.env.E2E_BACKEND_URL ?? "http://localhost:3001";

let cachedApiToken: string | null = null;

async function getApiTokenFromEnv(): Promise<string> {
  if (cachedApiToken) return cachedApiToken;

  const { email, password, configured } = getE2ECredentials();
  if (!configured || !email || !password) {
    throw new Error("E2E credentials not configured");
  }

  const supabaseUrl = process.env.E2E_SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey =
    process.env.E2E_SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("E2E_SUPABASE_URL and E2E_SUPABASE_ANON_KEY (or NEXT_PUBLIC_*) must be set");
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, { auth: { persistSession: false } });
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.session?.access_token) {
    throw new Error(error?.message ?? "Failed to obtain E2E API token");
  }

  cachedApiToken = data.session.access_token;
  return cachedApiToken;
}

async function resolveApiToken(page?: Page): Promise<string> {
  if (page) {
    try {
      return await getSessionTokenFromPage(page);
    } catch {
      // Fall back to direct Supabase sign-in when page session is unavailable.
    }
  }
  return getApiTokenFromEnv();
}

export function resetE2EApiToken() {
  cachedApiToken = null;
}

async function apiFetch<T>(
  path: string,
  options: { method?: string; query?: Record<string, string>; body?: unknown } = {},
  page?: Page,
): Promise<{ status: number; data: T }> {
  const token = await resolveApiToken(page);
  const url = new URL(path, BACKEND_URL);
  if (options.query) {
    for (const [k, v] of Object.entries(options.query)) url.searchParams.set(k, v);
  }

  const res = await fetch(url.toString(), {
    method: options.method ?? "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });

  const data = (await res.json().catch(() => ({}))) as T;
  return { status: res.status, data };
}

export async function cleanupWhatsAppConnections(page?: Page): Promise<void> {
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const { status, data } = await apiFetch<{ connections: Array<{ id: string; status: string }> }>(
      "/api/v1/whatsapp/connections",
      {},
      page,
    );

    if (status === 401) {
      throw new Error("cleanupWhatsAppConnections: unauthorized (check E2E seed and backend env)");
    }

    for (const conn of data.connections ?? []) {
      if (["CONNECTED", "REAUTH_REQUIRED", "CONNECTING", "ERROR"].includes(conn.status)) {
        await apiFetch(`/api/v1/whatsapp/connections/${conn.id}/disconnect`, { method: "POST", body: {} }, page);
      }
    }

    const check = await apiFetch<{ connections: Array<{ id: string; status: string }> }>(
      "/api/v1/whatsapp/connections",
      {},
      page,
    );
    const blocking = (check.data.connections ?? []).filter((c) =>
      ["CONNECTED", "REAUTH_REQUIRED", "CONNECTING"].includes(c.status),
    );
    if (blocking.length === 0) return;
  }
}

export type MockConnectionState = {
  connectionId: string;
  numberId: string | null;
};

export async function ensureMockWhatsAppConnected(page?: Page): Promise<MockConnectionState> {
  await cleanupWhatsAppConnections(page);

  for (let attempt = 0; attempt < 3; attempt += 1) {
    let start = await apiFetch<{
      connectionId: string;
      state: string;
      embeddedSignupConfigId: string;
    }>("/api/v1/whatsapp/connect/start", { method: "POST", body: {} }, page);

    if (start.status === 409) {
      await cleanupWhatsAppConnections(page);
      start = await apiFetch("/api/v1/whatsapp/connect/start", { method: "POST", body: {} }, page);
    }

    if (start.status === 401) {
      throw new Error("connect/start failed: 401 (check E2E seed and backend Supabase env)");
    }

    if (start.status >= 400) {
      throw new Error(`connect/start failed: ${start.status}`);
    }

    const callback = await apiFetch<{ connectionId: string; status: string }>(
      "/api/v1/whatsapp/connect/callback",
      {
        query: {
          connectionId: start.data.connectionId,
          state: start.data.state,
          code: "mock-embedded-code",
          wabaId: `mock-waba-e2e-${Date.now()}-${attempt}`,
          phoneNumberId: `pn-e2e-${Date.now()}-${attempt}`,
        },
      },
      page,
    );

    if (callback.status < 400 && callback.data.status === "CONNECTED") {
      const numbers = await apiFetch<{ whatsappNumbers: Array<{ id: string }> }>(
        "/api/v1/whatsapp/numbers",
        {},
        page,
      );

      return {
        connectionId: start.data.connectionId,
        numberId: numbers.data.whatsappNumbers?.[0]?.id ?? null,
      };
    }

    await cleanupWhatsAppConnections(page);
  }

  throw new Error("ensureMockWhatsAppConnected failed after retries");
}

export async function apiSyncConnection(page: Page, connectionId: string): Promise<number> {
  const res = await apiFetch(`/api/v1/whatsapp/connections/${connectionId}/sync`, {
    method: "POST",
    body: {},
  }, page);
  return res.status;
}

export async function apiTestNumber(page: Page, numberId: string): Promise<number> {
  const res = await apiFetch(`/api/v1/whatsapp/numbers/${numberId}/test`, {
    method: "POST",
    body: {},
  }, page);
  return res.status;
}

export async function apiDisconnectConnection(page: Page, connectionId: string): Promise<number> {
  const res = await apiFetch(`/api/v1/whatsapp/connections/${connectionId}/disconnect`, {
    method: "POST",
    body: {},
  }, page);
  return res.status;
}
