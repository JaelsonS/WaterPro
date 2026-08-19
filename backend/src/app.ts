import cors from "cors";
import express from "express";
import helmet from "helmet";
import { getEnv } from "./config/env";
import { healthRouter } from "./routes/health";
import { companyRouter } from "./routes/company";
import { createPublicSellersRouter } from "./routes/public/publicSellersRouter";
import { createPublicContactRoutingRouter } from "./routes/public/publicContactRoutingRouter";
import { createSupabasePublicDeps } from "./repositories/public/createSupabasePublicDeps";
import { sellersRouter } from "./routes/sellers";
import { whatsappNumbersRouter } from "./routes/whatsappNumbers";
import { aiSettingsRouter } from "./routes/aiSettings";
import { whatsappWebhookRouter } from "./routes/webhooks/whatsappWebhook";
import { conversationsRouter } from "./routes/conversations";
import { whatsappOnboardingRouter } from "./routes/whatsappOnboarding";
import { auditEventsRouter } from "./routes/auditEvents";
import { authSecurityRouter } from "./routes/authSecurity";
import { authRegisterRouter } from "./routes/authRegister";
import { createPublicAIChatRouter } from "./routes/public/publicAIChatRouter";
import { createSupabasePublicAIChatDeps } from "./repositories/public/createSupabasePublicAIChatDeps";
import { requestIdMiddleware } from "./middleware/requestId";
import { errorHandler } from "./middleware/errorHandler";
import { notFoundHandler } from "./middleware/notFound";
import { logger } from "./utils/logger";
import { createHttpLogger } from "./middleware/httpLogger";
import { publicRateLimit } from "./middleware/publicRateLimit";

export const app = express();

app.disable("x-powered-by");
app.use(helmet());

app.use(
  cors({
    origin: (origin, callback) => {
      const allowed = getEnv().CORS_ALLOWED_ORIGINS?.split(",").map((v) => v.trim()).filter(Boolean);
      // Sem allowlist configurada: mantém comportamento permissivo para dev/local.
      if (!allowed || allowed.length === 0) {
        if (!origin) return callback(null, true);
        return callback(null, true);
      }
      if (!origin) return callback(null, true);
      if (allowed.includes(origin)) return callback(null, true);
      return callback(new Error("CORS origin not allowed"));
    },
    credentials: true,
  }),
);

app.use(requestIdMiddleware);

app.use(createHttpLogger(logger));

app.use(
  express.json({
    limit: "1mb",
    verify: (req: express.Request, _res, buf) => {
      // Express chama "verify" antes de parsear o JSON.
      // Usamos isso para validar assinaturas de webhook (HMAC sobre bytes originais).
      (req as unknown as { rawBody?: Buffer }).rawBody = buf;
    },
  }),
);

app.use("/api/v1", healthRouter);
app.use("/api/v1", companyRouter);
app.use("/api/v1", sellersRouter);
app.use("/api/v1", whatsappNumbersRouter);
app.use("/api/v1", aiSettingsRouter);
app.use("/api/v1", conversationsRouter);
app.use("/api/v1", whatsappOnboardingRouter);
app.use("/api/v1", auditEventsRouter);
app.use("/api/v1", authSecurityRouter);
app.use("/api/v1", authRegisterRouter);
app.use("/api/v1", whatsappWebhookRouter);

const publicDeps = createSupabasePublicDeps();
app.use(
  "/api/v1",
  publicRateLimit,
  createPublicSellersRouter({ companyResolver: publicDeps.companyResolver, sellersRepo: publicDeps.sellersRepo }),
);
app.use(
  "/api/v1",
  publicRateLimit,
  createPublicContactRoutingRouter({
    companyResolver: publicDeps.companyResolver,
    sellersRepo: publicDeps.sellersRepo,
    whatsappNumbersRepo: publicDeps.whatsappNumbersRepo,
  }),
);

const publicAIChatDeps = createSupabasePublicAIChatDeps();
app.use(
  "/api/v1",
  publicRateLimit,
  createPublicAIChatRouter({
    companyResolver: publicAIChatDeps.companyResolver,
    aiSettingsRepo: publicAIChatDeps.aiSettingsRepo,
    knowledgeRepo: publicAIChatDeps.knowledgeRepo,
    aiProvider: publicAIChatDeps.aiProvider,
  }),
);

// Render (and outros load balancers) fazem probe em `/` por defeito.
app.get("/", (_req, res) => {
  res.status(200).json({
    status: "ok",
    service: "fluxora-api",
    health: "/api/v1/health",
  });
});

app.use(notFoundHandler);
app.use(errorHandler);

