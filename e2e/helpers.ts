import { test as base, expect } from "@playwright/test";

export const test = base;

export { expect };

export function getE2ECredentials() {
  const email = process.env.E2E_TEST_EMAIL;
  const password = process.env.E2E_TEST_PASSWORD;
  return { email, password, configured: Boolean(email && password) };
}

export async function getSessionTokenFromPage(page: import("@playwright/test").Page): Promise<string> {
  return page.evaluate(() => {
    const key = Object.keys(localStorage).find((k) => k.includes("auth-token"));
    if (!key) throw new Error("No Supabase auth token in localStorage");
    const raw = localStorage.getItem(key);
    if (!raw) throw new Error("Empty Supabase auth storage");
    const parsed = JSON.parse(raw) as { access_token?: string };
    if (!parsed.access_token) throw new Error("No access_token in Supabase session");
    return parsed.access_token;
  });
}

export async function loginToDashboard(page: import("@playwright/test").Page) {
  const { email, password, configured } = getE2ECredentials();
  if (!configured || !email || !password) {
    throw new Error("E2E_TEST_EMAIL and E2E_TEST_PASSWORD must be set");
  }

  await page.goto("/dashboard");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: /Entrar/i }).click();
  await page.waitForFunction(
    () => {
      const key = Object.keys(localStorage).find((k) => k.includes("auth-token"));
      if (!key) return false;
      const raw = localStorage.getItem(key);
      if (!raw) return false;
      try {
        return Boolean((JSON.parse(raw) as { access_token?: string }).access_token);
      } catch {
        return false;
      }
    },
    { timeout: 15_000 },
  );
  await page.goto("/dashboard/whatsapp");
  await expect(page.getByText(/Sem permissão para aceder a esta área/i)).not.toBeVisible({
    timeout: 20_000,
  });
}
