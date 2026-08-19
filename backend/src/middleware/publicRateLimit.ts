import rateLimit from "express-rate-limit";

// Limites conservadores para proteger abuso em endpoints públicos.
// Não mexemos em /webhooks (integração Meta não pode ser quebrada).
export const publicRateLimit = rateLimit({
  windowMs: 60_000, // 1 min
  max: 60, // 60 req/min por IP
  standardHeaders: true,
  legacyHeaders: false,
});

