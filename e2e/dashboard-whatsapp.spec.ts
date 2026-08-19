import { test, expect } from "./helpers";
import { getE2ECredentials, loginToDashboard } from "./helpers";
import {
  apiDisconnectConnection,
  apiSyncConnection,
  apiTestNumber,
  cleanupWhatsAppConnections,
  ensureMockWhatsAppConnected,
  resetE2EApiToken,
} from "./api/whatsappState";

test.describe("Dashboard route guard", () => {
  test("usuário não autenticado vê login em /dashboard", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByRole("heading", { name: /Área da empresa/i })).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
  });
});

test.describe("WhatsApp dashboard E2E determinístico (mock)", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeEach(async ({ page }) => {
    test.skip(!getE2ECredentials().configured, "E2E credentials not configured");
    resetE2EApiToken();
    await loginToDashboard(page);
    await cleanupWhatsAppConnections(page);
  });

  test.afterEach(async ({ page }) => {
    await cleanupWhatsAppConnections(page);
    resetE2EApiToken();
  });

  test("onboarding mock via UI: connect → números", async ({ page }) => {
    const state = await ensureMockWhatsAppConnected(page);
    expect(state.connectionId).toBeTruthy();

    await page.goto("/dashboard/whatsapp");
    await expect(page.getByText(/Conectado|Verificados/i).first()).toBeVisible({ timeout: 15_000 });
  });

  test("sync conclui com feedback", async ({ page }) => {
    const state = await ensureMockWhatsAppConnected(page);
    const status = await apiSyncConnection(page, state.connectionId);
    expect(status).toBe(200);

    await page.goto("/dashboard/whatsapp");
    await page.getByRole("button", { name: /Sincronizar/i }).click();
    await expect(page.getByText(/Sincronização concluída/i)).toBeVisible({ timeout: 10_000 });
  });

  test("disconnect com confirmação", async ({ page }) => {
    await ensureMockWhatsAppConnected(page);
    await page.goto("/dashboard/whatsapp");

    await page.getByRole("button", { name: /^Desconectar$/i }).click();
    await expect(page.getByRole("heading", { name: /Desconectar este WhatsApp/i })).toBeVisible();
    await page.getByRole("button", { name: /^Desconectar$/i }).last().click();
    await expect(page.getByText(/WhatsApp desconectado/i)).toBeVisible({ timeout: 10_000 });
  });

  test("test number mostra feedback técnico", async ({ page }) => {
    const state = await ensureMockWhatsAppConnected(page);
    expect(state.numberId).toBeTruthy();

    const status = await apiTestNumber(page, state.numberId!);
    expect(status).toBe(200);

    await page.goto("/dashboard/whatsapp");
    await page.getByRole("button", { name: /Testar número/i }).first().click();
    await expect(page.getByText(/Verificação executada com base no estado atual/i)).toBeVisible({
      timeout: 10_000,
    });
  });

  test("visão por vendedor mostra grupos reais", async ({ page }) => {
    await ensureMockWhatsAppConnected(page);
    await page.goto("/dashboard/whatsapp");
    await page.getByRole("button", { name: /Por vendedor/i }).click();
    await expect(page.getByRole("heading", { name: "Sem vendedor" })).toBeVisible({ timeout: 10_000 });
  });
});
