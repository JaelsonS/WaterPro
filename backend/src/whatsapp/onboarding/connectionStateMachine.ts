import type { WhatsAppConnectionStatus } from "./providerTypes";

/**
 * Allowed connection status transitions in the WaterPro WhatsApp onboarding flow.
 *
 * NOT_CONNECTED (UI) maps to no active CONNECTED/CONNECTING row.
 *
 * PENDING exists in DB default but startConnection uses CONNECTING directly.
 */
export const CONNECTION_TRANSITIONS: Record<
  WhatsAppConnectionStatus,
  ReadonlySet<WhatsAppConnectionStatus>
> = {
  PENDING: new Set(["CONNECTING", "ERROR", "DISCONNECTED"]),
  CONNECTING: new Set(["CONNECTED", "ERROR", "DISCONNECTED"]),
  CONNECTED: new Set(["REAUTH_REQUIRED", "DISCONNECTED", "ERROR"]),
  REAUTH_REQUIRED: new Set(["CONNECTING", "DISCONNECTED", "ERROR"]),
  DISCONNECTED: new Set(["CONNECTING"]),
  ERROR: new Set(["CONNECTING", "DISCONNECTED"]),
};

export function canTransition(from: WhatsAppConnectionStatus, to: WhatsAppConnectionStatus): boolean {
  if (from === to) return true;
  return CONNECTION_TRANSITIONS[from]?.has(to) ?? false;
}

export function assertValidTransition(from: WhatsAppConnectionStatus, to: WhatsAppConnectionStatus): void {
  if (!canTransition(from, to)) {
    throw new Error(`Invalid connection transition: ${from} → ${to}`);
  }
}
