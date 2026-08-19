import { WaterProApiError, type ApiErrorCode } from "@/lib/backend/apiErrors";

type ApiFetchOptions = {
  method: "GET" | "POST" | "PATCH" | "DELETE";
  token?: string;
  query?: Record<string, string | undefined>;
  body?: unknown;
  signal?: AbortSignal;
};

function buildBaseUrl() {
  return process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3001";
}

export async function waterproApiFetch<T>(path: string, options: ApiFetchOptions): Promise<T> {
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

  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
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
    throw new WaterProApiError(
      err.message || "Network request failed",
      0,
    );
  }

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
