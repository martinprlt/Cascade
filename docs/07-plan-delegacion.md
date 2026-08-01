# Plan de Delegación — Hackatón 26 (CASCADE / Pulso Riojano)

## 0. Estado real del repo (verificado)

| Bloque | Estado |
|---|---|
| `lib/` motor completo (types, grafo, motor, metricas, escenarios, ranking, validacion, explicador) | ✅ TERMINADO y verde |
| `data/red-la-rioja.json` (44 nodos, 48 aristas, esc-01..05, 7 fuentes, supuestos parametrizables) | ✅ CONGELABLE |
| `tests/motor.spec.ts` — 15 tests | ✅ **15/15 pasan** (recall 1.0, 2.900 usr, 2.880 m³, $60M, 15 camiones) |
| `typecheck` y `next build` | ✅ pasan |
| API routes (`/api/simular`, `/api/ranking`, `/api/validacion`, `/api/red`) | ✅ funcionan |
| `app/page.tsx` | ❌ **STUB** (solo lista endpoints) |
| `components/` (NetworkView, ScenarioPanel, ComparisonTable, MetricCard, ExplanationPanel) | ❌ **no existe** |
| `/api/explicar` (LLM one-shot + fallback) | ❌ no existe (el fallback determinístico sí: `lib/explicador.ts`) |
| Playwright (3 paths), k6 (p95<100ms) | ❌ no instalados |
| Tailwind/shadcn/React Flow | ❌ no instalados (repo usa CSS inline) |
| `docs/06-diseño.md` | ❌ no existe |

**Conclusión: el riesgo técnico (motor + validación) YA está resuelto. Todo lo que queda es UI, integración, explicador-LLM y evidencia de pruebas.**

## 0.1 Reglas anti-merge-hell (leer primero)

- División **por módulo/archivo**, no por feature transversal.
- **Contrato de props** fijado en los primeros 10 min (ver Hora 0). Lucas construye componentes puros que reciben props y llaman a las APIs; el Usuario es dueño de `app/page.tsx`, `components/NetworkView.tsx` y `app/api/explicar/route.ts`.
- **Nadie toca los archivos del otro.** El único archivo compartido es `lib/types.ts` (congelado, no se edita).
- ⚠️ Regla de oro para todo dev: `cargarDatosCascade()` usa `fs` → **solo en server (API routes)**. El frontend consume `/api/red`, nunca importa `lib/grafo.ts` desde componentes cliente.
- ⚠️ **NO instalar Tailwind/shadcn** (docs/03 lo asumía, el repo no lo tiene). Se usa CSS con variables custom (las define Diseño). React Flow (xyflow) solo si se instala en <30 min, si no → Plan B: SVG estático coloreado por severidad (lo decide el Usuario en Hora 1).

---

## 1. Listas de tareas por persona

### 🧑💻 USUARIO (dev + vibecoding) — módulo: integración, grafo, LLM, e2e

*Mayor riesgo técnico: React Flow, LLM con fallback, Playwright.*

1. **Contrato de props** (10 min): escribir `docs/07-contrato-ui.md` con las firmas de los 4 componentes que Lucas va a construir (`MetricCard`, `ScenarioPanel`, `ComparisonTable`, `ExplanationPanel`). Baseline: `ResultadoSimulacion`, `ResultadoManiobra[]`, `ResultadoValidacion` de `lib/types.ts`.
2. **`app/api/explicar/route.ts`**: POST `{resultado, escenarioId}` → arma prompt → llama LLM (one-shot) con timeout corto (2-3 s) y try/catch → **si falla, devuelve `explicacion` determinística de `lib/explicador.ts`**. Sin key de API → devolver directamente el fallback (el fallback ES el default, per docs/04 §4).
3. **`components/NetworkView.tsx`**: grafo 44 nodos/48 aristas coloreado por severidad (`sin_servicio`=rojo, `baja_presion`=naranja, `normal`=verde). Intento 1: React Flow (`npm i @xyflow/react`). Si >30 min de setup → **Plan B: SVG estático** (nodos posicionados manualmente, mismo API: `{nodos, aristas, severidad}` como props). Toggle: botón "ver red" + propagación.
4. **`app/page.tsx`**: dashboard real con 4 zonas (red + métricas grandes, panel de escenarios, comparación/ranking, explicador, tabla de validación). Consume `/api/simular`, `/api/ranking`, `/api/validacion`, `/api/explicar`.
5. **`tests/flujo-principal.spec.ts`** (Playwright, 3 paths): carga dashboard → simular esc-01 → comparar escenarios. `npm i -D @playwright/test` + `npx playwright install chromium` (si la red no deja, ver Riesgos).
6. **Correr el criterio de shippable** (docs/03): tests verdes + build + 3 corridas de punta a punto.
7. **Cerrar fallback real**: matar la red (dev tools offline) → el explicador determinístico aparece. Esto es contenido del pitch.

**Prompt hints (copiar y pegar en opencode/Claude):**
> "En este repo Next.js 15 + TS: creá `app/api/explicar/route.ts` que reciba `{escenarioId, resultado}` y devuelva la explicación determinística de `lib/explicador.ts`; si hay variable de entorno `OPENAI_API_KEY` (o la que prefieras), primero intentá un one-shot con fetch y timeout de 2500ms, y ante cualquier error caé al fallback. El fallback es el default por diseño. Sin key: directamente fallback."
> "Creá `components/NetworkView.tsx`: renderiza el grafo de `/api/red` (44 nodos, 48 aristas) con nodos posicionados estáticamente en SVG, coloreados por un prop `severidad: Record<string,'sin_servicio'|'baja_presion'|'normal'>`. Sin librerías externas, tipado estricto, que pase `tsc --noEmit`."
> "Armá `tests/flujo-principal.spec.ts` con Playwright: (1) carga la home y ve 'CASCADE', (2) tildo esc-01 y espero que aparezca '2.900' en la tarjeta de usuarios, (3) abro la comparación y veo 5 escenarios."

### 👨💻 LUCAS (dev) — módulo: componentes UI, tests, datos, k6

*Paralelo total al Usuario; no toca ni `page.tsx` ni `NetworkView.tsx`.*

1. **`components/MetricCard.tsx`**: tarjeta grande (label + número gigante + subtexto). Props: `{label, valor, sufijo?, tono?: 'rojo'|'verde'|'neutro'}`.
2. **`components/ScenarioPanel.tsx`**: lista de los 5 escenarios con toggle (checkbox estilo "falla Los Cactus"); onSelect(escenarioId). Los textos de los toggles van según el pitch (docs/04 §1: "falla perforación Av. Los Cactus").
3. **`components/ComparisonTable.tsx`**: tabla diff de escenarios (filas=escenarios, columnas: sin servicio, baja presión, m³, $, camiones) + ranking K≤10 con "mejor maniobra" destacada. Props: `{escenarios, resultadoComparacion}`.
4. **`components/ExplanationPanel.tsx`**: panel de texto con el explicador (determinístico o LLM, indistinguible a simple vista). Props: `{texto, fuente: 'deterministico'|'ia'}`.
5. **`tests/api.spec.ts`** (Vitest): test de integración de las 4 rutas con `fetch` contra `next dev` o directamente contra las funciones. Cubre 404/400 y el contrato JSON.
6. **`tests/k6/simulacion.js` + evidencias**: smoke 1 VU + carga 50 VUs/30 s sobre `/api/simular`, p95<100 ms. Instalar k6 (`winget install k6` o descargar binario). **Entregable: screenshot del summary como evidencia pre-grabada** (docs/04 §4: si no corre en vivo, se muestra el screenshot).
7. **`lib/mockData.ts`**: exportar `red` + escenarios desde `data/` para desarrollo sin backend (opcional, solo si sobra tiempo).
8. **QA manual**: 5 recorridos completos de la demo (docs/04 §6), reportar bugs al Usuario.

**Prompt hints:**
> "Creá `components/ComparisonTable.tsx` (shadcn NO está instalado, usá HTML semántico + CSS inline): tabla con 5 escenarios y columnas sin_servicio/baja_presion/deficitM3/costoMitigacionARS/camionesRequeridos, más una fila destacada para la mejor maniobra del ranking. Tipos: `ResultadoSimulacion` y `ResultadoManiobra` de `lib/types.ts`. Pasa `tsc --noEmit`."
> "Escribí `tests/api.spec.ts` con Vitest: arrancá el server de Next (spawn `npm run dev`) y testeá POST /api/simular (esc-01 → 200, deficitM3=2880), POST con id inválido → 404, POST sin id → 400, GET /api/validacion → recallPromedio=1."
> "Generá `tests/k6/simulacion.js` con k6: `http.post('http://localhost:3000/api/simular', {escenarioId:'esc-01'})`, opciones con stages 1 VU y 50 VUs/30s, thresholds `http_req_duration: ['p(95)<100']`. Después corré k6 y guardá el summary en `docs/evidencia-k6.txt`."

### 🎤 CHICO NUEVO (pitch) — arranca en Hora 0, no espera a nadie

*Todo el material base ya existe en docs/04 y docs/05. Trabajo: fusionar, memorizar, ensayar, blindar.*

1. **Decisión de identidad (5 min, con el equipo)**: ¿CASCADE o "Pulso Riojano" en pantalla? Recomendación: **CASCADE** como nombre del sistema (todo el material lo usa), "Pulso Riojano" como línea futura (ya está en el cierre).
2. **Guion final unificado (1 archivo)**: fusionar el guion base de `04-demo-pitch.md §2` con el institucional de `05 §6` → `docs/08-guion-final.md`. Elegir UNA voz (docs/05: una sola persona habla).
3. **Cheat sheet de números (imperativo)**: tabla con los números que DEBEN verse en pantalla, verificados contra los tests que ya pasan:
   - esc-01: 3 sin servicio / 9 baja presión / **2.900 usuarios** / **2.880 m³** / **$60.000.000** / **15 camiones** (real: 7→15)
   - recall **12/12 = 1.0** | esc-05: sin maniobra $81M vs combinada **$48M → $33M de ahorro (41%)**
4. **Flashcards de Q&A**: las 8 respuestas preparadas de `04 §4` + `05 §4` → tarjetas para ensayar (2°: "¿por qué no presión hidráulica?", "¿sirve solo para agua?", "¿son datos reales?").
5. **Guion de contingencia de 90 s** (docs/04 §1): si el jurado interrumpió o algo se rompe.
6. **Ensayo cronometrado**: 3 pasadas completas (16:30–17:00 es el bloque oficial; 2 pasadas más temprano, una con la demo real funcionando).
7. **Backup offline**: guion + cheat sheet impresos (o en el celular), y **grabar la demo en video** (Windows+G) como plan Z si el venue falla.
8. **Roles en el escenario**: decidir quién opera la laptop durante el pitch (recomendado: Lucas u otro dev; el que habla NO toca nada).

**Prompt hints:**
> "Tengo `docs/04-demo-pitch.md` y `docs/05-alineacion-aguas-riojanas.md`. Fusioná ambos en un guion único de 180 segundos para un jurado que incluye a Aguas Riojanas: usá el gancho institucional del 05 como apertura, el problema del 04, la demo de 60s, la evidencia con recall 1.0 y el cierre con 3 cifras + 'cuando llegue la telemetría este motor la consume'. Cada bloque debe marcar el tiempo acumulado en segundos. Guardalo en `docs/08-guion-final.md`."
> "Revisá mi guion (`docs/08-guion-final.md`) y señalá: frases de más de 20 palabras que suenen a lectura, tecnicismos que un jurado no técnico no entienda, y si la suma de bloques da exactamente 180 segundos. Después generá 10 preguntas difíciles de jurado y sus respuestas de una línea, basadas en docs/04 §4 y docs/05 §4."

### 🎨 CHICA NUEVA (diseño) — arranca en Hora 0, no espera a nadie

*Sin devs bloqueados: entrega paleta + wireframes + guía; los devs aplican. El repo actual es CSS inline puro, ideal para variables CSS.*

1. **`docs/06-diseño.md`**: sistema de diseño completo (con ayuda de IA):
   - **Paleta** con severidad accesible: rojo `#D92D20` / naranja `#F79009` / verde `#12B76A` (o similar, contraste AA sobre fondos claros y oscuros).
   - **Decisión dark vs light**: para proyector en sala con luz, recomendar **fondo oscuro con acentos claros** (menos reflejo, más contraste) — decisión documentada para que los devs no la discutan.
   - **Tipografía**: 3 escalas (métrica gigante ≥64 px, títulos ≥24 px, cuerpo ≥16 px) legibles a 5+ metros.
   - **Jerarquía del dashboard**: 4 zonas ordenadas según el flujo del demo (docs/04 §1): red arriba, métricas grandes a la vista, escenarios/rankear a la izquierda, explicador abajo.
2. **Wireframes de las 3 pantallas** de la demo (red → simulador → comparación+validación) en markdown/ASCII, siguiendo docs/04 §1.
3. **Variables CSS**: entregar como `app/globals.css` con `:root { --color-sin-servicio; --color-baja-presion; --color-normal; --metric-xxl; ... }` — los devs solo consumen variables, cero discusión.
4. **Estados de UI**: normal / simulando (loading de la propagación ~0,2 ms) / resultado (con severidad) / error (fallback explicador activado).
5. **Tabla de validación**: diseño de la tabla recall 1.0 que el pitch muestra como evidencia (docs/04 §1 paso 3-4) — debe verse el "12/12" gigante.
6. **Mobile/responsive mínimo**: el dashboard debe verse bien en la laptop del venue (1280×720) y no romperse en celular (es un plus, no requisito).
7. **QA visual final** (16:20): revisar la app real contra el docs/06 y corregir con los devs.

**Prompt hints:**
> "Creá `docs/06-diseño.md` para una demo de hackathon proyectada en sala con luz: paleta con 3 colores de severidad accesibles (contraste AA), tema oscuro recomendado para proyector, escala tipográfica legible a 5 metros (métrica gigante 64px+), jerarquía de dashboard para la app CASCADE (red, métricas, escenarios, explicador). Formato: variables CSS en `:root`. Todo en español."
> "Generá wireframes ASCII de 3 pantallas: (1) red de 44 nodos coloreada por severidad + 3 métricas gigantes; (2) panel de 5 escenarios con toggles y explicador debajo; (3) tabla de comparación de 5 escenarios + ranking de maniobras + tabla de validación con recall 12/12. Describí dónde va cada número del cheat sheet."

---

## 2. Orden de ejecución y dependencias

```
Hora 0   Contrato de props (Usuario) ─────────┐  → desbloquea a Lucas
                                               ├── → Lucas: componentes puros (sin motor, consume APIs)
Diseño: docs/06 + variables CSS ──────────────┤  → los devs consumen variables CSS a medida que existen
Pitch: guion final + cheat sheet (docs existen)│  → cero dependencias de devs
                                               │
Usuario: NetworkView + /api/explicar ──────────┼── → page.tsx integra (último eslabón, ~11:30)
Lucas: componentes ────────────────────────────┘
        ↓
Diseño aplica QA visual   │  Pitch: ensayo con demo real
        ↓
Playwright (Usuario) + k6 (Lucas) — necesitan la UI corriendo
        ↓
Pulido final + ensayo pitch + checklist 04 §5
```

- **Pitch NO espera**: los números ya están verificados (tests verdes). Solo necesita la demo real para el ensayo final (16:30).
- **Diseño NO espera**: docs/04 §1 define las pantallas; los componentes del grafo se colorean con los colores que ella fije (puede emitir la paleta antes de que exista cualquier componente).
- **Lucas NO espera el motor**: la API ya está; los componentes son puros.
- **page.tsx (Usuario) es el cuello de botella natural**: exige el contrato de props cerrado a las 10:40.

## 3. Milestones con tiempos

| Bloque | Tiempo | Quién | Entregable |
|---|---|---|---|
| **Kickoff** | 09:30–10:10 | Todos | Nombre en pantalla decidido; números congelados; **contrato de props** escrito; quién opera la laptop en el pitch |
| **Hora 0–1** | 10:10–11:10 | Usuario: NetworkView (o decisión Plan B SVG) + `/api/explicar` | grafo coloreado + explicador con fallback |
| | | Lucas: `MetricCard` + `ScenarioPanel` + esqueleto dashboard | 2 componentes verdes en `tsc` |
| | | Diseño: `docs/06-diseño.md` + `globals.css` + wireframes | paleta + jerarquía (los devs la aplican) |
| | | Pitch: guion unificado + cheat sheet + flashcards | `docs/08-guion-final.md` + 1° ensayo a cappella |
| **Hora 1–2** | 11:10–12:30 | Usuario: `page.tsx` integra todo + estados (loading/resultado/fallback) | dashboard funcional con 4 zonas |
| | | Lucas: `ComparisonTable` + `ExplanationPanel` + `tests/api.spec.ts` + k6 script | componentes + tests API verdes |
| | | Diseño: QA visual del dashboard en vivo, ajustes | observaciones aplicadas |
| | | Pitch: ensayo 2 con cronómetro; ajustar >170 s | guion calibrado |
| **Almuerzo** | 12:30–13:00 | Pitch: ensayo 3 | — |
| **Hora 3–4** | 15:00–15:40 | Todos: integración final + tabla validación + explicador en pantalla | demo corriendo punta a punta |
| **Hora 4–5** | 15:40–16:20 | Usuario: Playwright 3 paths (o evidencia) | tests e2e verdes o screenshot |
| | | Lucas: k6 corrida real → evidencia | `docs/evidencia-k6.txt` (p95<100ms) |
| | | Diseño: pulido visual + mobile check | app alineada a docs/06 |
| | | Pitch: ensayos 4-5 + **grabar video de la demo** (Windows+G) | backup en video |
| **Pre-demo** | 16:20–17:00 | Todos: checklist `04 §5` tachado completo + 2 pasadas del pitch con cronómetro | ready 16:45, 15 min de colchón |

## 4. Riesgos y mitigaciones

| Riesgo | Prob. | Mitigación |
|---|---|---|
| **React Flow no instala / setup lento** | Media | Plan B decidido en Hora 1: NetworkView en SVG estático, misma API de props. El pitch no diferencia. |
| **LLM caído / sin key / sin red** | Alta | Por diseño el fallback determinístico ES el default (`lib/explicador.ts`). Se demuestra el fallback de propósito en la demo ("si la IA falla, el texto determinístico queda"). |
| **Playwright no descarga browsers** (red del venue) | Media | Correr `npx playwright install chromium` apenas arranca el día (en paralelo con todo). Si falla: evidencia = tests Vitest verdes + screenshot, ya cubierto por docs/04 §4. |
| **k6 binario / thresholds** | Media | Instalar temprano (winget). Si no: evidencia pre-grabada es el entregable oficial (docs/04 §4). |
| **Merge hell** | Baja | Contrato de props + archivos disjuntos. Nadie edita `lib/types.ts`. |
| **`fs` en cliente** | Baja | Regla: frontend consume solo `/api/*`. Si un componente cliente importa `lib/grafo.ts`, el build falla → el usuario lo detecta en el primer `npm run build` diario. |
| **Proyector/sala: fuente ilegible** | Media | Diseño define métricas ≥64 px; ensayo de la demo en el venue (o con proyector del aula) antes de las 16:30. |
| **Falla total en vivo** | Baja | Video de la demo grabado (Windows+G) + cheat sheet impreso. Regla 04 §4: "no se improvisa en el escenario". |
| **Pitch > 180 s** | Media | Ensayos con cronómetro desde las 12:30; si >170 s se recorta bloque 3 o 5, NUNCA la demo. |

## 5. Tabla resumen

| Persona | Tareas | Depende de | Entregable | Herramientas IA |
|---|---|---|---|---|
| **Usuario (dev)** | Contrato props; NetworkView (React Flow→Plan B SVG); `/api/explicar` LLM+fallback; `page.tsx`; Playwright; criterio shippable; fallback demostrado | Contrato (10 min); paleta CSS de Diseño (parcial) | Dashboard integrado + e2e + demo punta a punta | opencode/Claude Code (mismo repo, tests como ancla) |
| **Lucas (dev)** | MetricCard, ScenarioPanel, ComparisonTable, ExplanationPanel; tests API; k6; mockData (opcional); QA manual | Contrato de props (Hora 0); variables CSS de Diseño | 4 componentes + tests API verdes + evidencia k6 | opencode/Cursor; IA genera componentes desde `lib/types.ts` |
| **Chico nuevo (pitch)** | Guion unificado 04+05; cheat sheet de números; flashcards Q&A; guion 90 s; 5 ensayos; backup offline + video; rol de operador de laptop | Nada (docs están completos; números ya verificados) | `docs/08-guion-final.md` + pitch calibrado ≤180 s + plan Z | ChatGPT/Claude web para unificar guion, generar preguntas y ensayar textos |
| **Chica nueva (diseño)** | docs/06-diseño.md; paleta AA + variables CSS; wireframes 3 pantallas; estados UI; tabla validación "12/12"; QA visual final | Nada (pantallas ya definidas en docs/04 §1) | `docs/06-diseño.md` + `globals.css` + QA aplicado | Claude/ChatGPT + v0 para explorar variantes visuales; IA redacta el doc de sistema |

**Checklist de cierre (17:00):** `motor.spec.ts` verde + dashboard corriendo + fallback probado + evidencia k6/Playwright + cheat sheet en mano + ensayos 2+ pasadas.
