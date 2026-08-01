import { expect, test } from "@playwright/test";

const NOMBRE_ESC05 = "Combinado: Los Cactus + Las Talas + cierre sector Este";
const MANIOBRA_ESC05 = "Combinada: reabrir Este + abrir interconexion sur-oeste";

test("carga el dashboard con la red y las metricas de esc-01", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "CASCADE" })).toBeVisible();
  await expect(page.getByText("red: 44 nodos · 48 aristas")).toBeVisible();

  await expect(page.getByText("Usuarios sin servicio")).toBeVisible();
  await expect(page.getByText("2.900")).toBeVisible();
  await expect(page.getByText("2.880")).toBeVisible();
  await expect(page.getByText("$60.000.000")).toBeVisible();
  await expect(page.getByText("15", { exact: true }).first()).toBeVisible();

  await expect(page.getByText("determinístico")).toBeVisible();
  await expect(page.getByText("12/12")).toBeVisible();
  await expect(page.getByText("recall 1")).toBeVisible();
  await expect(page.getByText("sin servicio 3/3 · baja presión 9/9")).toBeVisible();
});

test("simula un escenario y muestra la mejor maniobra del ranking", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("2.900")).toBeVisible();

  await page.getByRole("button", { name: NOMBRE_ESC05 }).click();

  await expect(page.getByText("MEJOR MANIOBRA · RANKING")).toBeVisible();
  await expect(page.getByText(MANIOBRA_ESC05)).toBeVisible();
  await expect(page.getByText("Ahorra $33.000.000 (41%)")).toBeVisible();
  await expect(page.getByText("5.400")).toBeVisible();
});

test("muestra los 5 escenarios y la tabla de validacion contra dic-2024", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("complementary").getByRole("button")).toHaveCount(5);
  await expect(page.getByRole("button", { name: "Falla perforacion Av. Los Cactus" })).toBeVisible();
  await expect(page.getByRole("button", { name: NOMBRE_ESC05 })).toBeVisible();

  await expect(page.getByText("VALIDACIÓN · ESC-01 VS DIC-2024")).toBeVisible();
  await expect(page.getByText("Predicción vs realidad")).toBeVisible();
  await expect(page.getByRole("columnheader", { name: "Barrio" })).toBeVisible();
  await expect(page.getByText("sin servicio (3)")).toBeVisible();
  await expect(page.getByText("baja presión (9)")).toBeVisible();
});
