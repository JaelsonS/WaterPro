import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { requireCompanyAdmin } from "../middleware/requireCompanyAdmin";
import { getBearerToken } from "../utils/auth";
import { HttpError } from "../errors/httpError";
import { isAdminMfaRequired, isSensitiveAdminRole, resolveAdminMfaStatus } from "../auth/adminMfaPolicy";

export const authSecurityRouter = Router();

authSecurityRouter.get("/auth/security-status", authMiddleware, requireCompanyAdmin, async (req, res, next) => {
  try {
    const token = getBearerToken(req);
    const userId = req.user?.userId;
    const role = req.user?.role;

    if (!token || !userId) {
      throw new HttpError({ statusCode: 401, code: "UNAUTHORIZED", message: "Missing bearer token" });
    }

    const mfaRequired = isAdminMfaRequired() && isSensitiveAdminRole(role);
    const status = mfaRequired ? await resolveAdminMfaStatus({ userId, accessToken: token }) : null;

    return res.status(200).json({
      product: "Fluxora",
      mfaRequired,
      role,
      mfaEnrolled: status?.mfaEnrolled ?? false,
      aal: status?.aal ?? "aal1",
      securityLevel: status?.securityLevel ?? "NORMAL_SESSION",
      enrollmentRequired: status?.enrollmentRequired ?? false,
      stepUpRequired: status?.stepUpRequired ?? false,
    });
  } catch (err) {
    return next(err);
  }
});
