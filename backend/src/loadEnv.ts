import dotenv from "dotenv";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Loads backend env files in priority order:
 * 1. backend/.env
 * 2. backend/.env.staging (local dev fallback when .env is absent)
 * 3. default dotenv lookup
 */
export function loadBackendEnv(): void {
  const backendRoot = resolve(__dirname, "..");
  const envPath = resolve(backendRoot, ".env");
  const stagingPath = resolve(backendRoot, ".env.staging");

  if (existsSync(envPath)) {
    dotenv.config({ path: envPath });
    return;
  }

  if (existsSync(stagingPath)) {
    dotenv.config({ path: stagingPath });
    return;
  }

  dotenv.config();
}
