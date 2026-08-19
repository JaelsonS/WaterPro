import { test, expect } from "@playwright/test";

test.describe("Landing page smoke", () => {
  test("home responde 200 com elementos principais", async ({ page }) => {
    const response = await page.goto("/");
    expect(response?.status()).toBe(200);

    await expect(page.locator("header, .header-immersive").first()).toBeVisible();
    await expect(page.locator("footer, [aria-label='Footer links']").first()).toBeVisible();
    await expect(page.locator("#main-content")).toBeVisible();
  });

  test("navegação pública permanece acessível", async ({ page }) => {
    await page.goto("/");
    const navLink = page.getByRole("link", { name: /Para Sua Casa|Serviços|Contacto/i }).first();
    if (await navLink.isVisible()) {
      await navLink.click();
      await expect(page).not.toHaveURL(/\/?$/);
    }
  });
});
