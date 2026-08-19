import { test, expect } from "./helpers";
import { getE2ECredentials, loginToDashboard } from "./helpers";

test.describe("Vendedores CRUD", () => {
  test.beforeEach(async ({ page }) => {
    test.skip(!getE2ECredentials().configured, "E2E credentials not configured");
    await loginToDashboard(page);
  });

  test("criar, editar e desativar vendedor", async ({ page }) => {
    await page.goto("/dashboard/vendedores");
    await expect(page.getByRole("heading", { name: /Vendedores/i })).toBeVisible();

    const uniqueName = `E2E Seller ${Date.now()}`;
    await page.getByRole("button", { name: /Adicionar vendedor/i }).first().click();
    await page.locator("#seller-name").fill(uniqueName);
    await page.getByRole("button", { name: /Guardar/i }).click();
    await expect(page.getByText(uniqueName)).toBeVisible({ timeout: 10_000 });

    await page.getByRole("button", { name: /Editar/i }).first().click();
    const editedName = `${uniqueName} Editado`;
    await page.locator("#seller-name").fill(editedName);
    await page.getByRole("button", { name: /Guardar/i }).click();
    await expect(page.getByText(editedName)).toBeVisible({ timeout: 10_000 });

    const deactivateBtn = page.getByRole("button", { name: /Desativar/i }).first();
    if (await deactivateBtn.isVisible()) {
      await deactivateBtn.click();
      await expect(page.getByText(/desativado|inativo|Desativado/i).first()).toBeVisible({
        timeout: 10_000,
      });
    }
  });
});
