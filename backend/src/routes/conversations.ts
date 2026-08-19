import { Router } from "express";
import { z } from "zod";
import { authMiddleware } from "../middleware/auth";
import { requireCompanyAdmin } from "../middleware/requireCompanyAdmin";
import { HttpError } from "../errors/httpError";
import { getBearerToken } from "../utils/auth";
import { createSupabaseUserClient } from "../config/supabase";

const conversationIdParamSchema = z.object({
  id: z.string().uuid(),
});

export const conversationsRouter = Router();

conversationsRouter.post("/conversations/:id/handoff", authMiddleware, requireCompanyAdmin, async (req, res, next) => {
  try {
    const token = getBearerToken(req);
    if (!token) return next(new HttpError({ statusCode: 401, code: "UNAUTHORIZED", message: "Missing token" }));

    const params = conversationIdParamSchema.parse(req.params);
    const supabase = createSupabaseUserClient(token);

    const { data, error } = await supabase
      .from("conversations")
      .update({ ai_enabled: false, status: "HUMAN_HANDOFF" })
      .eq("id", params.id)
      .select("id,company_id,seller_id,ai_enabled,status")
      .maybeSingle();

    if (error) throw error;
    if (!data) return next(new HttpError({ statusCode: 404, code: "NOT_FOUND", message: "Conversation not found" }));

    return res.status(200).json({ conversation: data });
  } catch (err) {
    return next(err);
  }
});

