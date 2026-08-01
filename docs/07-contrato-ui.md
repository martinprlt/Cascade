# Contrato de UI — CASCADE (docs/07-contrato-ui)

Contrato de props de los 4 componentes que construye **LUCAS**. Lo escribe el Usuario (dueño de `app/page.tsx`, `components/NetworkView.tsx`, `app/api/explicar/route.ts`) en Hora 0 para que Lucas trabaje en paralelo sin merge hell.

- **Tipos base (NO editar):** `lib/types.ts` (congelado). Exporta `Nodo`, `Arista`, `Severidad`, `ResultadoMetricas`, `ResultadoSimulacion`, `ResultadoManiobra`, `ResultadoValidacion`.
- **Paleta de severidad (variables CSS):** `--color-sin-servicio` (rojo `#D92D20`), `--color-baja-presion` (naranja `#F79009`), `--color-normal` (verde `#12B76A`). Definidas por Diseño en `app/globals.css`; los componentes usan las variables con fallback inline.
- **Reglas:** CSS inline / variables CSS, sin Tailwind ni shadcn. Los componentes son **puros**: reciben datos por props, no importan `lib/` (usa `fs` → solo server). Nada de comentarios en el código.

## Tipos compartidos del contrato

```ts
import type { ResultadoMetricas, ResultadoManiobra, ResultadoSimulacion, Severidad } from "../lib/types";

/** Resumen mínimo de un escenario, tal como lo entrega GET /api/red (campo escenarios). */
export interface EscenarioResumen {
  id: string;
  nombre: string;
  descripcion?: string;
}

/** Una fila de comparación: un escenario ya simulado + sus métricas. */
export interface ResultadoComparacion {
  escenarioId: string;
  escenarioNombre: string;
  severidadPorBarrio: Record<string, Severidad>;
  metricas: ResultadoMetricas;
}
```

## 1. `components/MetricCard.tsx`

Tarjeta de métrica grande (label chico + número gigante ≥64 px + sufijo + tono).

```ts
export interface MetricCardProps {
  label: string;
  valor: number | string;
  sufijo?: string; // "m³", "camiones", "%"
  tono?: "rojo" | "verde" | "neutro";
  sub?: string; // opcional: línea de contexto chica (ej. "real dic-2024: 7 → 15")
}
export default function MetricCard(props: MetricCardProps): JSX.Element;
```

Uso:

```tsx
<MetricCard label="Déficit (48 h)" valor={2880} sufijo="m³" />
<MetricCard label="Usuarios sin servicio" valor={2900} tono="rojo" />
<MetricCard label="Costo de mitigación" valor={"$60.000.000"} tono="rojo" sub="240 viajes de camión aguatero" />
```

## 2. `components/ScenarioPanel.tsx`

Lista de escenarios (toggle/radio). Al hacer click en uno, `page.tsx` dispara `POST /api/simular`.

```ts
export interface ScenarioPanelProps {
  escenarios: EscenarioResumen[];
  seleccionadoId: string | null;
  onSelect: (escenarioId: string) => void;
  deshabilitado?: boolean; // true mientras hay una simulación en curso
}
export default function ScenarioPanel(props: ScenarioPanelProps): JSX.Element;
```

Uso:

```tsx
<ScenarioPanel escenarios={escenarios} seleccionadoId={seleccionado} onSelect={(id) => simular(id)} deshabilitado={cargando} />
```

## 3. `components/ComparisonTable.tsx`

Tabla diff: una fila por escenario (columnas: sin servicio, baja presión, m³ déficit, $ costo, camiones) + ranking de maniobras opcional con la mejor destacada.

```ts
export interface ComparisonTableProps {
  escenarios: EscenarioResumen[];
  resultadoComparacion: ResultadoComparacion[];
  ranking?: {
    criterio?: string;
    resultados: ResultadoManiobra[]; // ya ordenados ascendente por costo (GET /api/ranking)
  };
}
export default function ComparisonTable(props: ComparisonTableProps): JSX.Element;
```

La mejor maniobra es `ranking.resultados[0]`: mostrarla destacada (borde/tono verde) con `nombre`, `metricas.costoMitigacionARS` y `metricas.camionesRequeridos`.

Uso:

```tsx
<ComparisonTable escenarios={escenarios} resultadoComparacion={comparacion} ranking={ranking} />
```

## 4. `components/ExplanationPanel.tsx`

Panel de texto de la explicación. La fuente es indistinguible a simple vista; solo un badge sutil (ver docs/04 §1 paso 4).

```ts
export type FuenteExplicacion = "deterministico" | "ia";

export interface ExplanationPanelProps {
  texto: string;
  fuente: FuenteExplicacion;
  cargando?: boolean;
}
export default function ExplanationPanel(props: ExplanationPanelProps): JSX.Element;
```

Uso:

```tsx
<ExplanationPanel texto={explicacion.texto} fuente={explicacion.fuente} cargando={explicando} />
```

## Notas de integración (para Lucas)

- El dashboard (`app/page.tsx`, del Usuario) consume **siempre** las APIs: `POST /api/simular`, `POST /api/ranking`, `GET /api/validacion`, `POST /api/explicar`, `GET /api/red`. NUNCA se importa `lib/grafo.ts` ni `lib/motor.ts` desde el cliente (usan `fs`).
- La comparación inicial del dashboard se construye simulando cada escenario con `/api/simular` (la tabla puede recibir 0..5 filas).
- Los nombres de escenarios a mostrar son los del JSON (`data/red-la-rioja.json` → `GET /api/red` → `escenarios[]`): ej. "Falla perforacion Av. Los Cactus".
- El dashboard usa un tema oscuro (`#0B1220` fondos, `#101B2E` tarjetas, `#E2E8F0` texto). Los componentes deben verse bien sobre ese fondo.
- Si un componente necesita un estado de carga, usar la prop `cargando`/`deshabilitado` prevista arriba; no agregar props sin avisar al Usuario para actualizar este contrato.
