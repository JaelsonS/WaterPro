import { test, expect } from "./helpers";
import { getE2ECredentials, loginToDashboard } from "./helpers";

test.describe("Dashboard MFA security UI", () => {
  test("definições mostra secção de segurança Fluxora", async ({ page }) => {
    test.skip(!getE2ECredentials().configured, "E2E credentials not configured");
    await loginToDashboard(page);
    await page.goto("/dashboard/definicoes");
    await expect(page.getByRole("heading", { name: /Segurança da conta/i })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByText(/Fluxora — plataforma AfDigital/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /Configurar MFA/i })).toBeVisible();
  });
});
