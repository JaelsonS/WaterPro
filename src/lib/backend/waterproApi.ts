import { refreshAccessToken } from "@/lib/auth/accessToken";
import { WaterProApiError, type ApiErrorCode } from "@/lib/backend/apiErrors";

type ApiFetchOptions = {
  method: "GET" | "POST" | "PATCH" | "DELETE";
  token?: string;
  query?: Record<string, string | undefined>;
  body?: unknown;
  signal?: AbortSignal;
  /** When true, do not force local logout on 401 (e.g. during signup provisioning). */
  skipAuthExpired?: boolean;
};

function buildBaseUrl() {
  return process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3001";
}

async function parseApiResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const status = res.status;
    const contentType = res.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      const json = await res.json().catch(() => null);
      const message = json?.error?.message ?? json?.message ?? `Request failed with status ${status}`;
      const code = json?.error?.code as ApiErrorCode | undefined;
      throw new WaterProApiError(message, status, code);
    }

    const text = await res.text().catch(() => "");
    throw new WaterProApiError(text || `Request failed with status ${status}`, status);
  }

  return (await res.json()) as T;
}

async function requestWithToken<T>(
  path: string,
  options: ApiFetchOptions,
  token: string | undefined,
): Promise<T> {
  const baseUrl = buildBaseUrl();
  const url = new URL(path, baseUrl);

  if (options.query) {
    for (const [k, v] of Object.entries(options.query)) {
      if (v === undefined) continue;
      url.searchParams.set(k, v);
    }
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(url.toString(), {
      method: options.method,
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      credentials: "omit",
      signal: options.signal,
    });
  } catch (e: unknown) {
    const err = e as Error;
    if (err.name === "AbortError") throw err;
    throw new WaterProApiError(err.message || "Network request failed", 0);
  }

  return parseApiResponse<T>(res);
}

function emitAuthExpired(options: ApiFetchOptions) {
  if (options.skipAuthExpired || typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("waterpro:auth-expired"));
}

export async function waterproApiFetch<T>(path: string, options: ApiFetchOptions): Promise<T> {
  const initialToken = options.token;
  try {
    return await requestWithToken<T>(path, options, initialToken);
  } catch (error) {
    if (!(error instanceof WaterProApiError) || error.status !== 401 || !initialToken) {
      throw error;
    }

    const refreshedToken = await refreshAccessToken();
    if (!refreshedToken || refreshedToken === initialToken) {
      // Only force logout when the session refresh itself failed (token truly dead).
      if (!refreshedToken) emitAuthExpired(options);
      throw error;
    }

    try {
      return await requestWithToken<T>(path, options, refreshedToken);
    } catch (retryError) {
      if (retryError instanceof WaterProApiError && retryError.status === 401) {
        emitAuthExpired(options);
      }
      throw retryError;
    }
  }
}
