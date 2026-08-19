export type AdminSecurityLevel =
  | "NORMAL_SESSION"
  | "MFA_VERIFIED"
  | "STEP_UP_REQUIRED"
  | "STEP_UP_VERIFIED";

export type SecurityStatusResponse = {
  product: string;
  mfaRequired: boolean;
  role?: string;
  mfaEnrolled: boolean;
  aal: "aal1" | "aal2";
  securityLevel: AdminSecurityLevel;
  enrollmentRequired: boolean;
  stepUpRequired: boolean;
};

const STEP_UP_TTL_MS = 15 * 60 * 1000;

export function markStepUpVerifiedLocally(): void {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.setItem("fluxora_step_up_verified_at", String(Date.now()));
}

export function isLocalStepUpFresh(): boolean {
  if (typeof sessionStorage === "undefined") return false;
  const raw = sessionStorage.getItem("fluxora_step_up_verified_at");
  if (!raw) return false;
  const ts = Number(raw);
  if (!Number.isFinite(ts)) return false;
  return Date.now() - ts < STEP_UP_TTL_MS;
}

export function clearLocalStepUp(): void {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.removeItem("fluxora_step_up_verified_at");
}

export function resolveClientSecurityLevel(status: SecurityStatusResponse | null): AdminSecurityLevel {
  if (!status?.mfaRequired) return "NORMAL_SESSION";
  if (status.enrollmentRequired) return "NORMAL_SESSION";
  if (status.aal === "aal2" || isLocalStepUpFresh()) return "MFA_VERIFIED";
  if (status.stepUpRequired) return "STEP_UP_REQUIRED";
  return "NORMAL_SESSION";
}
