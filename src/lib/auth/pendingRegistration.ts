const STORAGE_KEY = "fluxora_pending_registration";

export type PendingRegistration = {
  email: string;
  companyName: string;
  createdAt: number;
};

export function savePendingRegistration(payload: PendingRegistration) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

export function readPendingRegistration(email?: string | null): PendingRegistration | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as PendingRegistration;
    if (!parsed.email || !parsed.companyName) return null;
    if (email && parsed.email.toLowerCase() !== email.toLowerCase()) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearPendingRegistration() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(STORAGE_KEY);
}
