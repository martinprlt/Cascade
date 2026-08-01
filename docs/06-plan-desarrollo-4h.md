# CASCADE — Plan de Desarrollo Acelerado en 4 Horas (2 Personas / Agentes IA)

Este documento define la hoja de ruta para completar el 100% del MVP de CASCADE en **4 horas**, aprovechando maquetación acelerada con **v0** y la división eficiente del trabajo entre **dos personas / agentes de IA**.

---

## 🎯 Estado Actual vs Objetivo

| Área | Estado Actual | Objetivo tras 4 Horas |
|---|---|---|
| **Motor & Datos** | 100% Completo (`lib/motor.ts`, `data/red-la-rioja.json`) | Sin cambios necesarios (mantener determinista) |
| **APIs del Motor** | Completo (`/api/simular`, `/api/ranking`, `/api/red`, `/api/validacion`) | Agregar `/api/explicar` con IA y fallback |
| **Frontend / UI** | Placeholder simple en HTML (`app/page.tsx`) | Dashboard interactivo completo con React Flow + Tailwind + v0 |
| **Testing** | Vitest y K6 funcionales | Añadir suite E2E en Playwright (`tests/flujo-principal.spec.ts`) |

---

## 📦 0. Configuración Inicial e Instalación de Dependencias (15 min - Trabajo Conjunto)

Ejecutar en la raíz del proyecto (`Cascade-main`):

```bash
npm install @xyflow/react lucide-react clsx tailwind-merge
npm install -D tailwindcss postcss autoprefixer @playwright/test
```

---

## 👥 División de Tareas por Rol / Agente IA

### 🎨 PERSONA / AGENTE A: Frontend & Visualización de Red (UI / UX / React Flow)

**Enfoque principal:** Creación de componentes React, gráficos de red interactivos con React Flow y maquetación de dashboard utilizando prompts para **v0**.

#### ⏱️ HORA 1 (00:15 - 01:15): Visualización Interactiva del Grafo (`components/NetworkView.tsx`)
* Crear `components/NetworkView.tsx` integrando `@xyflow/react`.
* Mapear los 44 nodos de `data/red-la-rioja.json` a nodos personalizados de React Flow (Fuentes, Válvulas, Barrios).
* Implementar coloreado dinámico según severidad:
  * 🟢 **Verde (`normal`):** Servicio normal.
  * 🟠 **Naranja (`baja_presion`):** Pérdida parcial de fuentes.
  * 🔴 **Rojo (`sin_servicio`):** Pérdida total de servicio.
* Agregar zoom, pan y tooltip con información del nodo al pasar el mouse.

#### ⏱️ HORA 2 (01:15 - 02:15): Panel de Escenarios y Métricas (`components/ScenarioPanel.tsx` y `MetricCard.tsx`)
* **Prompt para v0:** *"Genera un panel de control en React + Tailwind con diseño oscuro/moderno para seleccionar escenarios de infraestructura y mostrar 4 tarjetas con números gigantes (usuarios sin servicio, déficit m³, costo $ ARS y camiones aguateros)."*
* Crear `components/MetricCard.tsx` para mostrar métricas destacadas con íconos de `lucide-react`.
* Crear `components/ScenarioPanel.tsx` con toggles interactivas para cambiar entre los 5 escenarios pre-horneados (`esc-01` a `esc-05`).

#### ⏱️ HORA 3 (02:15 - 03:15): Tabla Comparativa y Ranking (`components/ComparisonTable.tsx`)
* **Prompt para v0:** *"Crea una tabla en Tailwind CSS para comparar escenarios de fallas en red de agua, resaltando en verde la maniobra óptima de menor costo y ordenando las alternativas."*
* Crear `components/ComparisonTable.tsx` que despliegue la comparación lado a lado de los 5 escenarios y la tabla de ranking de alternativas.
* Resaltar con un badge especial la maniobra óptima (`man-05`) y el ahorro en pesos ($ ARS).

#### ⏱️ HORA 4 (03:15 - 04:00): Integración de Dashboard en `app/page.tsx` & Pulido Visual
* Integrar todos los componentes creados en `app/page.tsx`.
* Aplicar estilos globales (glassmorphism, tipografía moderna, colores oscuros armoniosos).
* Garantizar que la interfaz responda fluidamente al cambiar de escenarios.

---

### ⚙️ PERSONA / AGENTE B: Backend/IA, Integración API, Explicador & Tests E2E

**Enfoque principal:** Endpoint `/api/explicar`, integración de IA con fallback determinista, conexión de APIs y suite de pruebas E2E en Playwright.

#### ⏱️ HORA 1 (00:15 - 01:15): Endpoint de Explicación e Integración LLM (`app/api/explicar/route.ts` & `lib/explicador.ts`)
* Actualizar `lib/explicador.ts` para soportar llamada *one-shot* a un modelo LLM (OpenAI / Gemini / Ollama API) pasando el contexto de la simulación.
* Garantizar **mecanismo de fallback determinista**: si la llamada al LLM falla (o no hay API Key), se retorna automáticamente el texto determinista de plantilla sin lanzar excepciones.
* Crear el endpoint `app/api/explicar/route.ts` (`POST { escenarioId, resultado }`).

#### ⏱️ HORA 2 (01:15 - 02:15): Componente `ExplanationPanel.tsx` & Conexión de Estado
* Crear `components/ExplanationPanel.tsx` para mostrar el texto explicativo generado.
* Agregar badge dinámico indicando el origen del texto (`IA Generativa` vs `Motor Determinista (Fallback)`).
* Implementar hooks de comunicación con las APIs `/api/simular`, `/api/ranking`, `/api/explicar` y `/api/red`.

#### ⏱️ HORA 3 (02:15 - 03:15): Pruebas E2E con Playwright (`tests/flujo-principal.spec.ts`)
* Configurar Playwright en el proyecto.
* Crear `tests/flujo-principal.spec.ts` cubriendo los 3 flujos obligatorios:
  1. Carga correcta del dashboard y renderizado del grafo de la red.
  2. Selección del escenario de validación (`esc-01`) y verificación de cambio de color en nodos (3 rojos, 9 naranjas) y métricas.
  3. Despliegue de la tabla comparativa y validación del ranking de alternativas.

#### ⏱️ HORA 4 (03:15 - 04:00): Integración Final, Benchmarking & Verificación de Criterio Shippable
* Correr suite completa de pruebas: `npm test` (Vitest), `npx playwright test` y K6 (`tests/k6/simulacion.js`).
* Verificar la latencia de respuesta (`p95 < 100 ms` en `/api/simular`).
* Comprobar que la demo completa se puede ejecutar 3 veces seguidas sin fallas.

---

## 📋 Resumen del Cronograma de 4 Horas

```
TIEMPO     PERSONA / AGENTE A (Frontend & UI)       PERSONA / AGENTE B (Backend, IA & Tests)
─────────────────────────────────────────────────────────────────────────────────────────────
00:00-00:15  [Configuración Inicial: npm install de dependencias en conjunto]
00:15-01:15  NetworkView.tsx (React Flow + Colores)   /api/explicar (LLM + Fallback)
01:15-02:15  ScenarioPanel.tsx & MetricCard.tsx      ExplanationPanel.tsx + Fetch APIs
02:15-03:15  ComparisonTable.tsx (Ranking UI)        Playwright E2E (flujo-principal.spec.ts)
03:15-04:00  Integración en app/page.tsx + UX        Verificación Vitest + K6 + Demo Check
```

---

## ✅ Criterio de Finalización (Shippable Check)

Al finalizar las 4 horas, se deben cumplir los siguientes puntos:
1. `npm test` (Vitest) en verde (recall 1.0 verificado).
2. `npx playwright test` ejecutando y pasando los 3 flujos.
3. `/api/simular` con latencia p95 < 100 ms en K6.
4. Dashboard web 100% navegable en `localhost:3000` con visualización en React Flow.
5. Explicador funcionando con IA o fallback determinista transparente.
