const BLOCKED_KEYS = new Set([
  "access_token",
  "refresh_token",
  "token",
  "authorization",
  "cookie",
  "app_secret",
  "client_secret",
  "password",
  "embeddedcode",
  "embedded_code",
  "code",
  "nonce",
  "onboardingstate",
  "onboarding_state",
  "onboardingnonce",
  "onboarding_nonce",
  "secret",
  "credentials",
  "otp",
  "totp",
  "qr_code",
  "qrcode",
  "secret_reference",
]);

const BLOCKED_SUBSTRINGS = ["bearer ", "access_token=", "refresh_token="];

function isBlockedKey(key: string): boolean {
  const normalized = key.toLowerCase().replace(/[-_]/g, "");
  for (const blocked of BLOCKED_KEYS) {
    if (normalized.includes(blocked.replace(/[-_]/g, ""))) return true;
  }
  return false;
}

function sanitizeValue(value: unknown, depth = 0): unknown {
  if (depth > 4) return "[TRUNCATED]";
  if (value === null || value === undefined) return value;
  if (typeof value === "string") {
    const lower = value.toLowerCase();
    if (BLOCKED_SUBSTRINGS.some((s) => lower.includes(s))) return "[REDACTED]";
    if (value.length > 500) return `${value.slice(0, 500)}…`;
    return value;
  }
  if (typeof value !== "object") return value;
  if (Array.isArray(value)) {
    return value.slice(0, 20).map((item) => sanitizeValue(item, depth + 1));
  }
  const out: Record<string, unknown> = {};
  for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
    if (isBlockedKey(key)) {
      out[key] = "[REDACTED]";
    } else {
      out[key] = sanitizeValue(nested, depth + 1);
    }
  }
  return out;
}

export function sanitizeAuditMetadata(metadata: Record<string, unknown> | undefined): Record<string, unknown> {
  if (!metadata) return {};
  return sanitizeValue(metadata) as Record<string, unknown>;
}
