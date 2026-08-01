---
name: cascade-ui-generator
description: Guía de maquetación de interfaz con v0, Tailwind CSS, React Flow (@xyflow/react) y componentes para el Dashboard visual de CASCADE.
---

# CASCADE — Skill: Generación de UI & Prompts v0 (`cascade-ui-generator`)

Esta skill define el sistema de diseño, los prompts estructurados para **v0** y las reglas para maquetar el Dashboard interactivo de CASCADE en Next.js.

## 🎨 Sistema de Diseño y Tokens de Color

* **Estilo:** Modo Oscuro Premium / Glassmorphism (`bg-slate-950/80 backdrop-blur-md border border-slate-800`).
* **Severidad de Red:**
  * 🔴 **Sin Servicio:** Red/Rose (`#ef4444` / `bg-rose-500/20 text-rose-400 border-rose-500/50`)
  * 🟠 **Baja Presión:** Amber/Orange (`#f97316` / `bg-amber-500/20 text-amber-400 border-amber-500/50`)
  * 🟢 **Normal:** Emerald/Green (`#10b981` / `bg-emerald-500/20 text-emerald-400 border-emerald-500/50`)
* **Tipografía:** Sans-serif moderna (Inter / Geist).

---

## 🧩 Componentes Faltantes a Maquetar

### 1. Visualización de Red (`components/NetworkView.tsx`)
Mapea los 44 nodos de `data/red-la-rioja.json` utilizando `@xyflow/react`.
* Nodos de Perforación / Acueducto (Fuentes): Ícono de gota / agua.
* Nodos de Válvula / Bomba / Tanque: Íconos de control.
* Nodos de Barrio: Nodos coloreados en vivo según la severidad retornada por `POST /api/simular`.

### 2. Panel de Escenarios (`components/ScenarioPanel.tsx`)
Controles tipo Toggle para seleccionar los 5 escenarios:
* `esc-01`: Falla Perforación Av. Los Cactus (Validación Dic-2024).
* `esc-02`: Falla Parcial Acueducto Sanagasta (2.200 → 830 m³/h).
* `esc-03`: Cierre Válvula Sector Este.
* `esc-04`: Falla Perforación Las Talas.
* `esc-05`: Combinado + Ranking de Alternativas.

### 3. Tarjetas de Métricas (`components/MetricCard.tsx`)
Mostrar en números gigantes de alto impacto:
* 👥 Usuarios Sin Agua (ej: 2.900)
* 🚰 Déficit m³ en 48h (ej: 2.880 m³)
* 💵 Costo de Mitigación (ej: $ 60.000.000 ARS)
* 🚛 Camiones Requeridos (ej: 15 camiones)

### 4. Tabla Comparativa & Ranking (`components/ComparisonTable.tsx`)
Despliega la comparación lado a lado y resalta la maniobra recomendada (ej: `man-05` combinada con ahorro de $33M ARS).

---

## 🤖 Prompts Recomendados para v0.dev

```text
"Crea un dashboard en React + Tailwind CSS con tema oscuro (slate-950) para simulación de redes de agua potable. Debe contener:
1. Header con logo CASCADE, indicador de estado determinista y tiempo de respuesta en ms.
2. Grid principal con 4 MetricCards de números gigantes (usuarios sin servicio, m³ déficit, costo ARS y camiones).
3. Panel lateral para alternar entre 5 escenarios de falla con badges de severidad.
4. Tabla comparativa de maniobras de contingencia resaltando en verde emerald la opción óptima de menor costo."
```
