import "express";

declare module "express-serve-static-core" {
  interface Request {
    requestId?: string;
    rawBody?: Buffer;
    // Placeholder para o futuro (auth/tenant).
    user?: {
      userId: string;
      companyId?: string;
      role?: string;
    };
  }
}

