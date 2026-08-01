---
name: cascade-e2e-benchmarker
description: Automatización de pruebas end-to-end con Playwright y benchmarking de rendimiento p95 < 100 ms con k6.
---

# CASCADE — Skill: Testing E2E & Benchmarker (`cascade-e2e-benchmarker`)

Esta skill proporciona las instrucciones y configuraciones necesarias para ejecutar las pruebas automatizadas E2E de interfaz y las pruebas de rendimiento bajo carga.

## 🧪 Pruebas E2E en Playwright (`tests/flujo-principal.spec.ts`)

La suite de pruebas E2E debe validar los 3 flujos clave definidos en el alcance:

```ts
import { test, expect } from "@playwright/test";

test.describe("Flujo Principal Dashboard CASCADE", () => {
  test("1. Carga inicial del tablero y visualizacion de la red", async ({ page }) => {
    await page.goto("http://localhost:3000");
    await expect(page.locator("h1")).toContainText("CASCADE");
  });

  test("2. Seleccionar escenario esc-01 y verificar métricas del evento real", async ({ page }) => {
    await page.goto("http://localhost:3000");
    // Seleccionar escenario esc-01
    await page.click('[data-testid="escenario-esc-01"]');
    // Verificar métricas del evento real
    await expect(page.locator('[data-testid="metric-usuarios-sin-servicio"]')).toContainText("2.900");
    await expect(page.locator('[data-testid="metric-camiones"]')).toContainText("15");
  });

  test("3. Visualizar ranking de alternativas en escenario combinado esc-05", async ({ page }) => {
    await page.goto("http://localhost:3000");
    await page.click('[data-testid="escenario-esc-05"]');
    await expect(page.locator('[data-testid="ranking-mejor-maniobra"]')).toBeVisible();
  });
});
```

---

## ⚡ Pruebas de Carga con K6 (`tests/k6/simulacion.js`)

Para asegurar la regla de rendimiento **p95 < 100 ms** en `/api/simular`:

```bash
k6 run tests/k6/simulacion.js
```

### Criterios de Aprobación en K6:
* **http_req_duration p(95) < 100 ms**
* **http_req_failed < 1%**
* **VUs objetivo:** 50 VUs continuas durante 30 segundos.
