import { createSupabaseAdminClient } from "../config/supabase";
import { getJwtAal } from "../utils/jwtClaims";

export type AdminSecurityLevel =
  | "NORMAL_SESSION"
  | "MFA_VERIFIED"
  | "STEP_UP_REQUIRED"
  | "STEP_UP_VERIFIED";

export type AdminMfaStatus = {
  mfaEnrolled: boolean;
  aal: "aal1" | "aal2";
  securityLevel: AdminSecurityLevel;
  stepUpRequired: boolean;
  enrollmentRequired: boolean;
};

export function isAdminMfaRequired(): boolean {
  if (process.env.E2E_SKIP_MFA === "1") return false;
  if (process.env.ADMIN_MFA_REQUIRED === "false") return false;
  return true;
}

export async function resolveAdminMfaStatus(params: {
  userId: string;
  accessToken: string;
}): Promise<AdminMfaStatus> {
  const aal = getJwtAal(params.accessToken);
  const mfaEnrolled = await userHasVerifiedMfaFactor(params.userId);

  if (!mfaEnrolled) {
    return {
      mfaEnrolled: false,
      aal,
      securityLevel: "NORMAL_SESSION",
      stepUpRequired: false,
      enrollmentRequired: true,
    };
  }

  if (aal === "aal2") {
    return {
      mfaEnrolled: true,
      aal,
      securityLevel: "MFA_VERIFIED",
      stepUpRequired: false,
      enrollmentRequired: false,
    };
  }

  return {
    mfaEnrolled: true,
    aal,
    securityLevel: "STEP_UP_REQUIRED",
    stepUpRequired: true,
    enrollmentRequired: false,
  };
}

export async function userHasVerifiedMfaFactor(userId: string): Promise<boolean> {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin.auth.admin.mfa.listFactors({ userId });
  if (error) throw error;

  const factors = data?.factors ?? [];
  return factors.some((factor) => factor.status === "verified");
}

export function isSensitiveAdminRole(role: string | undefined): boolean {
  return role === "company_admin" || role === "platform_admin";
}
