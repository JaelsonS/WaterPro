import { Router } from "express";
import { z } from "zod";
import { authMiddleware } from "../middleware/auth";
import { requireCompanyAdmin } from "../middleware/requireCompanyAdmin";
import { HttpError } from "../errors/httpError";
import { getEnv } from "../config/env";
import { createSupabaseWhatsAppOnboardingRepository } from "../adapters/supabaseWhatsAppOnboardingRepository";
import { WhatsAppConnectionService } from "../whatsapp/onboarding/whatsappConnectionService";
import { MockWhatsAppOnboardingProvider } from "../whatsapp/onboarding/mockWhatsAppOnboardingProvider";
import { MetaWhatsAppOnboardingProvider } from "../whatsapp/onboarding/metaWhatsAppOnboardingProvider";
import { toPublicConnectionDTO } from "../whatsapp/onboarding/connectionDto";
import { createAuditService } from "../audit/createAuditService";
import { requireAdminMfa } from "../middleware/requireAdminMfa";

const startSchema = z.object({});
const callbackSchema = z.object({
  connectionId: z.string().uuid(),
  state: z.string().min(1),
  code: z.string().min(1),
  wabaId: z.string().optional(),
  phoneNumberId: z.string().optional(),
});

function createOnboardingService() {
  const providerMode = getEnv().WHATSAPP_PROVIDER ?? "mock";
  const metaConfigIdEnv = getEnv().META_EMBEDDED_SIGNUP_CONFIG_ID;
  const metaConfigId: string =
    providerMode === "meta" ? (metaConfigIdEnv as string) : metaConfigIdEnv ?? "mock-config";

  if (providerMode === "meta" && !metaConfigId) {
    throw new HttpError({
      statusCode: 500,
      code: "INTERNAL_ERROR",
      message: "META_EMBEDDED_SIGNUP_CONFIG_ID missing. Configure it in backend env.",
    });
  }

  const repo = createSupabaseWhatsAppOnboardingRepository();
  const provider =
    providerMode === "meta" ? new MetaWhatsAppOnboardingProvider() : new MockWhatsAppOnboardingProvider();

  return new WhatsAppConnectionService({
    repo,
    provider,
    metaEmbeddedSignupConfigId: metaConfigId,
    audit: createAuditService(),
  });
}

export const whatsappOnboardingRouter = Router();

whatsappOnboardingRouter.post(
  "/whatsapp/connect/start",
  authMiddleware,
  requireCompanyAdmin,
  requireAdminMfa("step_up"),
  async (req, res, next) => {
  try {
    startSchema.parse(req.body);

    if (!req.user?.companyId || !req.user?.userId) {
      throw new HttpError({ statusCode: 403, code: "FORBIDDEN", message: "Tenant context missing" });
    }

    const service = createOnboardingService();
    const result = await service.startConnection({ companyId: req.user.companyId, userId: req.user.userId });

    return res.status(result.reused ? 200 : 201).json({
      connectionId: result.connectionId,
      embeddedSignupConfigId: result.embeddedSignupConfigId,
      state: result.state,
      expiresAt: result.expiresAt,
      reused: result.reused,
    });
  } catch (err) {
    return next(err);
  }
});

whatsappOnboardingRouter.get(
  "/whatsapp/connect/callback",
  authMiddleware,
  requireCompanyAdmin,
  requireAdminMfa("step_up"),
  async (req, res, next) => {
  try {
    const query = callbackSchema.parse(req.query);
    if (!req.user?.companyId) throw new HttpError({ statusCode: 403, code: "FORBIDDEN", message: "Tenant context missing" });

    const service = createOnboardingService();
    const result = await service.handleCallback({
      companyId: req.user.companyId,
      userId: req.user.userId,
      connectionId: query.connectionId,
      onboardingState: query.state,
      embeddedCode: query.code,
      wabaId: query.wabaId,
      phoneNumberId: query.phoneNumberId,
    });

    return res.status(200).json({
      connectionId: result.connectionId,
      status: result.status,
      idempotent: result.idempotent,
    });
  } catch (err) {
    return next(err);
  }
});

whatsappOnboardingRouter.get("/whatsapp/connections", authMiddleware, requireCompanyAdmin, async (req, res, next) => {
  try {
    const companyId = req.user?.companyId;
    if (!companyId) throw new HttpError({ statusCode: 403, code: "FORBIDDEN", message: "Tenant context missing" });

    const repo = createSupabaseWhatsAppOnboardingRepository();
    const connections = await repo.listConnections(companyId);

    return res.status(200).json({ connections: connections.map(toPublicConnectionDTO) });
  } catch (err) {
    return next(err);
  }
});

whatsappOnboardingRouter.get("/whatsapp/connections/:id", authMiddleware, requireCompanyAdmin, async (req, res, next) => {
  try {
    const companyId = req.user?.companyId;
    const connectionId = z.object({ id: z.string().uuid() }).parse(req.params).id;
    if (!companyId) throw new HttpError({ statusCode: 403, code: "FORBIDDEN", message: "Tenant context missing" });

    const repo = createSupabaseWhatsAppOnboardingRepository();
    const connection = await repo.getConnectionByIdAndCompany({ connectionId, companyId });
    if (!connection) {
      throw new HttpError({ statusCode: 404, code: "NOT_FOUND", message: "Connection not found" });
    }
    return res.status(200).json({ connection: toPublicConnectionDTO(connection) });
  } catch (err) {
    return next(err);
  }
});

whatsappOnboardingRouter.post(
  "/whatsapp/connections/:id/disconnect",
  authMiddleware,
  requireCompanyAdmin,
  requireAdminMfa("step_up"),
  async (req, res, next) => {
  try {
    const companyId = req.user?.companyId;
    const connectionId = z.object({ id: z.string().uuid() }).parse(req.params).id;
    if (!companyId) throw new HttpError({ statusCode: 403, code: "FORBIDDEN", message: "Tenant context missing" });

    const service = createOnboardingService();
    const result = await service.disconnect({ companyId, userId: req.user?.userId, connectionId });
    return res.status(200).json({ connectionId: result.connectionId, idempotent: result.idempotent });
  } catch (err) {
    return next(err);
  }
});

whatsappOnboardingRouter.post(
  "/whatsapp/connections/:id/sync",
  authMiddleware,
  requireCompanyAdmin,
  requireAdminMfa("step_up"),
  async (req, res, next) => {
  try {
    const companyId = req.user?.companyId;
    const connectionId = z.object({ id: z.string().uuid() }).parse(req.params).id;
    if (!companyId) throw new HttpError({ statusCode: 403, code: "FORBIDDEN", message: "Tenant context missing" });

    const service = createOnboardingService();
    const result = await service.sync({ companyId, userId: req.user?.userId, connectionId });
    return res.status(200).json({ connection: toPublicConnectionDTO(result.connection) });
  } catch (err) {
    return next(err);
  }
});
