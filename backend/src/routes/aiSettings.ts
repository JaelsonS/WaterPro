import { Router } from "express";
import { z } from "zod";
import { authMiddleware } from "../middleware/auth";
import { requireCompanyAdmin } from "../middleware/requireCompanyAdmin";
import { HttpError } from "../errors/httpError";
import { getBearerToken } from "../utils/auth";
import { createSupabaseUserClient } from "../config/supabase";

const aiSettingsUpdateSchema = z
  .object({
    enabled: z.boolean().optional(),
    assistantName: z.string().min(1).max(160).optional(),
    systemPrompt: z.string().optional(),
    welcomeMessage: z.string().optional(),
    handoffEnabled: z.boolean().optional(),
    handoffMessage: z.string().optional(),
    model: z.string().min(1).max(120).optional(),
    temperatureIfSupported: z.number().optional(),
    maxOutputTokensIfSupported: z.number().int().optional(),
  })
  .strict();

export const aiSettingsRouter = Router();

aiSettingsRouter.get("/ai/settings", authMiddleware, requireCompanyAdmin, async (req, res, next) => {
  try {
    const token = getBearerToken(req);
    if (!token) return next(new HttpError({ statusCode: 401, code: "UNAUTHORIZED", message: "Missing token" }));

    const companyId = req.user?.companyId;
    if (!companyId) return next(new HttpError({ statusCode: 403, code: "FORBIDDEN", message: "Company context required" }));

    const supabase = createSupabaseUserClient(token);
    const { data, error } = await supabase
      .from("ai_settings")
      .select("*")
      .eq("company_id", companyId)
      .maybeSingle();

    if (error) throw new HttpError({ statusCode: 500, code: "INTERNAL_ERROR", message: "Failed to load ai settings" });

    return res.status(200).json({ aiSettings: data });
  } catch (err) {
    return next(err);
  }
});

aiSettingsRouter.patch("/ai/settings", authMiddleware, requireCompanyAdmin, async (req, res, next) => {
  try {
    const token = getBearerToken(req);
    if (!token) return next(new HttpError({ statusCode: 401, code: "UNAUTHORIZED", message: "Missing token" }));

    const companyId = req.user?.companyId;
    if (!companyId) return next(new HttpError({ statusCode: 403, code: "FORBIDDEN", message: "Company context required" }));

    const body = aiSettingsUpdateSchema.parse(req.body);
    const supabase = createSupabaseUserClient(token);

    const existing = await supabase.from("ai_settings").select("id").eq("company_id", companyId).maybeSingle();
    if (existing.error) throw existing.error;

    const payload = {
      company_id: companyId,
      enabled: body.enabled,
      assistant_name: body.assistantName,
      system_prompt: body.systemPrompt,
      welcome_message: body.welcomeMessage,
      handoff_enabled: body.handoffEnabled,
      handoff_message: body.handoffMessage,
      model: body.model,
      temperature_if_supported: body.temperatureIfSupported,
      max_output_tokens_if_supported: body.maxOutputTokensIfSupported,
    };

    // remove undefined fields
    Object.keys(payload).forEach((k) => (payload as Record<string, unknown>)[k] === undefined && delete (payload as Record<string, unknown>)[k]);

    let data;
    if (existing.data) {
      const updateRes = await supabase
        .from("ai_settings")
        .update(payload)
        .eq("company_id", companyId)
        .select("*")
        .maybeSingle();
      if (updateRes.error) throw updateRes.error;
      data = updateRes.data;
    } else {
      const insertRes = await supabase.from("ai_settings").insert(payload).select("*").maybeSingle();
      if (insertRes.error) throw insertRes.error;
      data = insertRes.data;
    }

    return res.status(200).json({ aiSettings: data });
  } catch (err) {
    return next(err);
  }
});

