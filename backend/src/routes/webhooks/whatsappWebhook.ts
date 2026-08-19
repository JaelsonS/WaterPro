import crypto from "crypto";
import { Router } from "express";
import { z } from "zod";
import { createIncomingWhatsAppService } from "../../services/incoming/incomingWhatsAppService";
import { createSupabaseIncomingWhatsAppDeps } from "../../adapters/supabaseIncomingWhatsAppDeps";
import { createSupabaseIncomingPipelineDeps } from "../../adapters/supabaseIncomingPipelineDeps";
import { createIncomingMessagePipeline } from "../../services/processing/incomingMessagePipeline";
import { MockAIProvider } from "../../ai/mockAIProvider";
import { MockWhatsAppProvider } from "../../whatsapp/mockWhatsAppProvider";
import { createSupabaseAdminClient } from "../../config/supabase";
import { verifyMetaWebhookSignature } from "../../whatsapp/verifyMetaWebhookSignature";
import { requireWhatsAppWebhookEnv } from "../../config/env";
import { HttpError } from "../../errors/httpError";

const router = Router();

router.get("/webhooks/whatsapp", async (req, res, next) => {
  try {
    const env = requireWhatsAppWebhookEnv();
    const schema = z.object({
      "hub.mode": z.string().optional(),
      "hub.verify_token": z.string().optional(),
      "hub.challenge": z.string(),
    });

    const parsed = schema.parse(req.query);
    if (parsed["hub.mode"] !== "subscribe") {
      return res.sendStatus(403);
    }

    if (parsed["hub.verify_token"] !== env.WHATSAPP_VERIFY_TOKEN) {
      return res.sendStatus(403);
    }

    // Meta expects the challenge raw value (not JSON).
    return res.status(200).send(parsed["hub.challenge"]);
  } catch (err) {
    return next(new HttpError({ statusCode: 400, code: "BAD_REQUEST", message: "Invalid webhook verification request" }));
  }
});

router.post("/webhooks/whatsapp", async (req, res, next) => {
  try {
    const env = requireWhatsAppWebhookEnv();

    const rawBody = (req as unknown as { rawBody?: Buffer }).rawBody;
    if (!rawBody) {
      return next(new HttpError({ statusCode: 400, code: "BAD_REQUEST", message: "Missing rawBody for signature verification" }));
    }

    const signatureHeader = req.headers["x-hub-signature-256"];
    const isValid = verifyMetaWebhookSignature({
      rawBody,
      signatureHeader,
      appSecret: env.WHATSAPP_APP_SECRET,
    });

    if (!isValid) {
      return next(new HttpError({ statusCode: 401, code: "UNAUTHORIZED", message: "Invalid webhook signature" }));
    }

    const payload = req.body as unknown;
    // Minimal validation to avoid crashes.
    const schema = z
      .object({
        entry: z.array(
          z.object({
            changes: z.array(
              z.object({
                field: z.string(),
                value: z.any(),
              }),
            ),
          }),
        ),
      })
      .strict();

    const parsed = schema.parse(payload);

    const payloadHash = crypto.createHash("sha256").update(rawBody).digest("hex");
    const provider: "meta" = "meta";
    const eventType = "messages";

    // Respond quickly; heavy processing can be async.
    res.sendStatus(200);

    void (async () => {
      const supabase = createSupabaseAdminClient();
      const pipelineDeps = createSupabaseIncomingPipelineDeps();

      const aiProvider = new MockAIProvider();
      const whatsappProvider = new MockWhatsAppProvider();
      const pipeline = createIncomingMessagePipeline({
        aiProvider,
        whatsappProvider,
        deps: pipelineDeps,
      });

      for (const entry of parsed.entry) {
        for (const change of entry.changes) {
          if (change.field !== "messages") continue;

          const value = change.value as any;
          const metadata = value?.messages?.[0] ? value.metadata : value.metadata;
          const phoneNumberId = metadata?.phone_number_id;
          if (!phoneNumberId) continue;

          // Resolve whatsapp_numbers row (tenant)
          const { data: waNumber } = await supabase
            .from("whatsapp_numbers")
            .select("id,company_id")
            .eq("phone_number_id", phoneNumberId)
            .eq("status", "active")
            .maybeSingle();

          if (!waNumber) continue;

          const whatsappNumberId = waNumber.id;
          const companyId = waNumber.company_id;

          const incomingService = createIncomingWhatsAppService(createSupabaseIncomingWhatsAppDeps(companyId));

          const contacts0 = value?.contacts?.[0];
          const customerName = contacts0?.profile?.name as string | undefined;

          const messages = value?.messages ?? [];
          for (const m of messages) {
            const externalMessageId = m?.id as string | undefined;
            const customerPhone = m?.from as string | undefined;
            const type = m?.type as string | undefined;
            const textBody = m?.text?.body as string | undefined;

            if (!externalMessageId || !customerPhone || type !== "text" || !textBody) continue;

            const result = await incomingService.processIncoming({
              provider,
              externalEventId: externalMessageId,
              eventType,
              payloadHash,
              whatsappNumberId,
              customerPhone,
              customerName,
              messageText: textBody,
              externalMessageId,
            });

            if (!result.duplicated) {
              await pipeline.process({
                conversationId: result.conversationId,
                toPhone: customerPhone,
                customerMessageText: textBody,
              });
            }
          }
        }
      }
    })();
  } catch (err) {
    return next(err);
  }
});

export { router as whatsappWebhookRouter };

