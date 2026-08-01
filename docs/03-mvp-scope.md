# CASCADE — Alcance del MVP

Regla de oro: **lo que no está en este documento, no se construye.** La demo es de 3 minutos y el equipo tiene un sábado: cada feature fuera de esta lista es riesgo de no llegar a la validación de las 17:00.

## 1. ADENTRO del MVP (lista priorizada)

| # | Ítem | Prioridad | Notas |
|---|---|---|---|
| 1 | Grafo hand-built de la red de Capital | P0 | 44 nodos / 48 aristas en `data/red-la-rioja.json`, con nombres reales y supuestos marcados |
| 2 | Motor de propagación + métricas | P0 | Función pura determinista en TypeScript, sin I/O; severidad sin_servicio/baja_presión/normal; fórmulas de §3.4 de 01-arquitectura.md |
| 3 | 5 escenarios pre-horneados | P0 | esc-01 a esc-05 (ver §2) |
| 4 | Comparación de escenarios | P0 | Tabla diff entre escenarios + ranking de alternativas (K ≤ 10) |
| 5 | Métricas grandes en pantalla | P0 | Usuarios sin servicio, m³ de déficit, $ de mitigación |
| 6 | Explicador determinístico + LLM one-shot con fallback | P1 | La IA solo redacta; si el LLM no responde, el texto determinístico es el resultado (default) |
| 7 | Tabla de validación predicción vs realidad | P0 | esc-01 contra dic-2024: 12 barrios, recall 1.0 |
| 8 | Tests: unit del motor con fixture del evento real | P0 | `motor.spec.ts` corre esc-01 y exige los 12 barrios exactos |
| 9 | Playwright (3 paths) | P1 | Carga del dashboard; ejecutar escenario; comparar escenarios |
| 10 | k6 (smoke + carga sobre `/api/simular`) | P1 | Smoke: 1 VU; carga: 50 VUs / 30 s; **p95 < 100 ms** |

## 2. Los 5 escenarios pre-horneados

| id | Escenario | Mutaciones | Resultado esperado (48 h, supuestos estándar) |
|---|---|---|---|
| esc-01 | Falla perforación Av. Los Cactus (**validación**) | falla `perf-los-cactus` | 3 barrios sin servicio, 9 con baja presión; 2.880 m³ déficit; $60.000.000; **15 camiones** (real: 7 → 15); recall 1.0 |
| esc-02 | Falla parcial acueducto Sanagasta (2.200 → 830) | reduccion `acu-sanagasta` a 830 + cierre `valvula-rama-alta` | San Nicolás y Don Bosco sin servicio (ramal alto); Centro y sector Este (Yacampis, La Rodadera, Centro Comercial) con baja presión (pierden la fuente acueducto, conservan las perforaciones del oeste); 2.400 m³; $50.000.000; 13 camiones |
| esc-03 | Cierre válvula sector Este | cierre `valvula-este` | Yacampis, La Rodadera, Centro Comercial sin servicio; 1.000 m³; $21.000.000; 6 camiones |
| esc-04 | Falla perforación Las Talas | falla `perf-las-talas` | Zona sur pierde 1 de 5 fuentes → 9 barrios con baja presión; 1.720 m³; $36.000.000; 9 camiones |
| esc-05 | Combinado + ranking de alternativas | falla `perf-los-cactus` + falla `perf-las-talas` + cierre `valvula-este` | 5.400 sin servicio, 8.600 con baja presión; 3.880 m³; $81.000.000; 21 camiones; ranking: maniobra combinada (reabrir este + interconexión sur-oeste) baja a 2.300 m³ y $48.000.000 |

Candidatos del ranking de esc-05 (K=5): abrir `valvula-inter-sur-oeste` ($68.750.000, 18 camiones), abrir `valvula-inter-sur-este` (idem, empate técnico), reabrir `valvula-este` ($60.000.000, 15), **combinada** ($48.000.000, 12 — mejor), sin maniobra ($81.000.000, 21 — peor).

## 3. AFUERA del MVP (y por qué)

| Fuera | Por qué |
|---|---|
| Login / auth | No hay usuarios ni datos personales en la demo; agrega latencia y superficie de falla |
| Telemetría real en tiempo real | No existe API pública de Aguas Riojanas; los datos del evento son de prensa |
| Edición de red en canvas | Solo toggles laterales predefinidos; arrastrar nodos consume horas de frontend |
| Max-flow / cortes mínimos | Resuelven capacidad, no alcance; decisión consciente documentada en 01-arquitectura.md §5(b) |
| Incrementalidad del grafo | Circular como optimización; micro-benchmark honesto (0,2 ms); futuro a escala |
| Multi-infraestructura (gas/energía/logística) | La genericidad es visión, no promesa; el demo es agua |
| PULSO RIOJANO (tarifa eléctrica + nivel de acuífero + alerta WhatsApp) | Idea validada del equipo, pero es otra vertical: va como una diapositiva de próximos pasos en el pitch |
| Simulación hidráulica (presión real) | Fuera del alcance del modelo de grafos; respuesta honesta preparada en 04-demo-pitch.md §4 |

## 4. Stack y estructura de carpetas

**Stack:** Next.js (App Router) + TypeScript + Tailwind + shadcn/ui (frontend maquetado con v0) + React Flow (xyflow, solo visualización del grafo). Motor en TypeScript puro: función determinística sin I/O, compartida entre el navegador y los tests.

```
data/red-la-rioja.json              # grafo + escenarios + supuestos (única fuente de verdad)
app/
  page.tsx                          # dashboard: red + métricas
  api/simular/route.ts              # POST {escenarioId} → motor determinista (blanco de k6)
  api/explicar/route.ts             # POST {resultado} → LLM one-shot con fallback
components/
  ui/                              # shadcn/ui
  NetworkView.tsx                  # React Flow: grafo coloreado por severidad
  ScenarioPanel.tsx                # toggles de escenarios (falla Los Cactus, etc.)
  ComparisonTable.tsx              # tabla diff + ranking
  MetricCard.tsx                   # métricas grandes (usuarios, m³, $)
  ExplanationPanel.tsx             # explicación en lenguaje natural (IA con fallback)
lib/
  grafo.ts                         # tipos + carga de red-la-rioja.json
  motor.ts                         # fuentes() + severidad (función pura)
  metricas.ts                      # déficit, viajes, costo, camiones, severidad
  escenarios.ts                    # 5 escenarios pre-horneados
  validacion.ts                    # tabla predicción vs realidad (recall)
  explicador.ts                    # plantillas determinísticas + cliente LLM one-shot
  mockData.ts                      # datos de red para desarrollo sin backend
tests/
  motor.spec.ts                    # unit: fixture del evento real (esc-01, recall 1.0)
  flujo-principal.spec.ts          # Playwright: 3 paths
  k6/simulacion.js                 # smoke + carga sobre POST /api/simular
```

**Criterio de shippable:** `motor.spec.ts` en verde + Playwright con los 3 paths + k6 con p95 < 100 ms + demo corriendo de punta a punta 3 veces seguidas sin tocar nada.
