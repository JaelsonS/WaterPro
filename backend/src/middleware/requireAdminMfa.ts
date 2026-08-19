import type { NextFunction, Request, Response } from "express";
import { HttpError } from "../errors/httpError";
import { getBearerToken } from "../utils/auth";
import {
  isAdminMfaRequired,
  isSensitiveAdminRole,
  resolveAdminMfaStatus,
} from "../auth/adminMfaPolicy";
import { createAuditService } from "../audit/createAuditService";
import { MFA_AUDIT_EVENTS } from "../audit/auditEventTypes";

export type AdminMfaGate = "enrollment" | "step_up";

export function requireAdminMfa(gate: AdminMfaGate) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    if (!isAdminMfaRequired()) return next();

    const role = req.user?.role;
    if (!isSensitiveAdminRole(role)) return next();

    const token = getBearerToken(req);
    const userId = req.user?.userId;
    if (!token || !userId) {
      return next(new HttpError({ statusCode: 401, code: "UNAUTHORIZED", message: "Missing bearer token" }));
    }

    try {
      const status = await resolveAdminMfaStatus({ userId, accessToken: token });

      if (gate === "enrollment" && status.enrollmentRequired) {
        await recordMfaAudit(req, MFA_AUDIT_EVENTS.STEP_UP_REQUIRED, {
          gate,
          reason: "enrollment_required",
        });
        return next(
          new HttpError({
            statusCode: 403,
            code: "MFA_ENROLLMENT_REQUIRED",
            message: "Configure autenticação de dois fatores para aceder a esta área.",
          }),
        );
      }

      if (gate === "step_up" && status.enrollmentRequired) {
        await recordMfaAudit(req, MFA_AUDIT_EVENTS.STEP_UP_REQUIRED, {
          gate,
          reason: "enrollment_required",
        });
        return next(
          new HttpError({
            statusCode: 403,
            code: "MFA_ENROLLMENT_REQUIRED",
            message: "Configure autenticação de dois fatores antes de executar esta ação.",
          }),
        );
      }

      if (gate === "step_up" && status.stepUpRequired) {
        await recordMfaAudit(req, MFA_AUDIT_EVENTS.STEP_UP_REQUIRED, { gate });
        return next(
          new HttpError({
            statusCode: 403,
            code: "MFA_STEP_UP_REQUIRED",
            message: "Verificação de segurança necessária para executar esta ação.",
          }),
        );
      }

      return next();
    } catch {
      return next(new HttpError({ statusCode: 500, code: "INTERNAL_ERROR", message: "Failed to verify MFA status" }));
    }
  };
}

async function recordMfaAudit(
  req: Request,
  eventType: string,
  metadata: Record<string, unknown>,
): Promise<void> {
  if (!req.user?.companyId) return;
  const audit = createAuditService();
  await audit.record({
    companyId: req.user.companyId,
    actorUserId: req.user.userId,
    eventType,
    resourceType: "admin_security",
    resourceId: req.user.userId,
    metadata,
  });
}
