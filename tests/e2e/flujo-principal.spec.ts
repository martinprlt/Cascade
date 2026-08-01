import { expect, test } from "@playwright/test";

const NOMBRE_ESC05 = "Combinado: Los Cactus + Las Talas + cierre sector Este";
const MANIOBRA_ESC05 = "Combinada: reabrir Este + abrir interconexion sur-oeste";

test("carga el dashboard con la red y las metricas de esc-01", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByText("CASCADE WATER SIM")).toBeVisible();
  await expect(page.getByText("Usuarios sin servicio")).toBeVisible();
  await expect(page.getByText("2.900")).toBeVisible();
  await expect(page.getByText("2.880")).toBeVisible();
  await expect(page.getByText("$60.000.000")).toBeVisible();
  await expect(page.getByText("15", { exact: true }).first()).toBeVisible();

  await expect(page.getByText("DETERMINÍSTICO")).toBeVisible();
  await expect(page.getByText("RECALL 12/12 (1.0)")).toBeVisible();
  await expect(page.getByText("Sin servicio (3)")).toBeVisible();
  await expect(page.getByText("Baja presión (9)")).toBeVisible();
});

test("simula un escenario y muestra la maniobra recomendada", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("2.900")).toBeVisible();

  await page.getByRole("button", { name: NOMBRE_ESC05 }).click();

  await expect(page.getByText("MANIOBRA RECOMENDADA")).toBeVisible();
  await expect(page.getByText(MANIOBRA_ESC05)).toBeVisible();
  await expect(page.getByText("AHORRO $33.000.000")).toBeVisible();
  await expect(page.getByText("5.400")).toBeVisible();
});

test("muestra los 5 escenarios y la tabla de validacion contra dic-2024", async ({ page }) => {
  await page.goto("/");

  const botonesEscenario = page
    .getByRole("complementary")
    .getByRole("button")
    .filter({ hasNotText: "EJECUTAR" });
  await expect(botonesEscenario).toHaveCount(5);
  await expect(page.getByRole("button", { name: "Falla perforacion Av. Los Cactus" })).toBeVisible();
  await expect(page.getByRole("button", { name: NOMBRE_ESC05 })).toBeVisible();

  await expect(page.getByText("VALIDACIÓN HISTÓRICA (DIC-2024)")).toBeVisible();
  await expect(page.getByRole("columnheader", { name: "BARRIO" })).toBeVisible();
});
