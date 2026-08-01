# CASCADE — Arquitectura y especificación algorítmica

Este documento es la especificación de referencia del motor. Todo lo que no está acá, no se implementa (ver 03-mvp-scope.md). Los números que figuran corresponden a `data/red-la-rioja.json` (44 nodos, 48 aristas).

## 1. Arquitectura en capas

```
┌─────────────────────────────────────────────────────────────┐
│ 5. EXPLICADOR                 determinístico + LLM one-shot │
│    plantillas de lenguaje natural; la IA redacta, no decide │
│    fallback determinístico SIEMPRE activo (default real)    │
├─────────────────────────────────────────────────────────────┤
│ 4. RANKING DE ALTERNATIVAS    K maniobras (K ≤ 10)          │
│    corre el motor sobre cada una, ordena por costo total    │
├─────────────────────────────────────────────────────────────┤
│ 3. EVALUADOR DE ESCENARIOS    métricas por escenario        │
│    usuarios, m³ de déficit, $ de mitigación, severidad      │
├─────────────────────────────────────────────────────────────┤
│ 2. MOTOR DE PROPAGACIÓN       BFS inverso desde cada barrio │
│    conjuntos de fuentes por barrio → severidad (sin/baja)   │
├─────────────────────────────────────────────────────────────┤
│ 1. MODELO DE INFRAESTRUCTURA  grafo dirigido ponderado      │
│    nodos (fuentes, válvulas, barrios) + aristas + mutaciones│
└─────────────────────────────────────────────────────────────┘
```

Flujo de una simulación: `POST /api/simular` recibe `{escenarioId}` → se clona el grafo base → se aplican las mutaciones del escenario → el motor computa fuentes y severidad por barrio → el evaluador produce métricas → el explicador redacta el texto. El motor es **una función pura sin I/O** en TypeScript: mismo input, mismo output, siempre. Esa función es la que testea k6 y la que valida el evento de diciembre 2024.

## 2. Estructura de datos

```ts
type TipoNodo = "perforacion" | "tanque" | "valvula" | "bomba" | "barrio" | "acueducto";
type EstadoNodo = "activo" | "fallado" | "cerrado" | "reducido";

interface Nodo {
  id: string;                 // "perf-los-cactus"
  nombre: string;             // "Perforación Av. Los Cactus"
  tipo: TipoNodo;
  zona: "oeste" | "sur" | "este" | "centro";
  usuarios?: number;          // solo barrios (supuesto de modelado)
  m3Dia?: number;             // demanda = usuarios × 0,2 m³ (supuesto)
  caudalHorarioM3?: number;   // solo fuentes: perforacion | acueducto
  estado: EstadoNodo;
  subTipo?: string;           // ej. "distribuidor" en válvulas
}

interface Arista {
  from: string;
  to: string;
  dirigida: true;             // el agua fluye en un solo sentido
  etiqueta: string;           // "cañería", "interconexión (cerrada por defecto)"
  estado: "abierta" | "cerrada";
  capacidad?: number;         // m³/h nominal, informativo
}
```

El grafo base tiene todo activo salvo las interconexiones de emergencia (`valvula-inter-sur-oeste`, `valvula-inter-sur-este`), que nacen **cerradas**.

## 3. Especificación algorítmica

### 3.1 Conjunto de fuentes de cada barrio — propagación inversa (BFS)

Se elige **propagación inversa** (desde el barrio hacia atrás, siguiendo aristas entrantes) en lugar de propagación desde cada fuente. Justificación: los escenarios son fallas locales, los consumidores son ~18 nodos y las fuentes ~14. Propagar hacia adelante desde cada fuente obliga a recorrer todo el subárbol de la fuente aunque la falla no lo toque; la propagación inversa solo explora el universo de alimentación del barrio, cuyo tamaño no depende de dónde esté la falla. En la red de Capital ambos costos son irrelevantes (~0,2 ms); la elección importa para grafos a escala (ver §6, decisión (a)).

```pseudocode
FUNCION fuentes(barrio, G):
  visitados <- {}
  fuentes  <- {}
  cola     <- [barrio]
  mientras cola no está vacía:
    n <- desencolar(cola)
    si n ∈ visitados: continuar
    visitados <- visitados ∪ {n}
    si tipo(n) ∈ {perforacion, acueducto} y estado(n) = "activo":
      fuentes <- fuentes ∪ {n}
    si no:
      para cada (f, t, e) ∈ aristasEntrantes(G, n) con e.estado = "abierta":
        encolar(cola, f)
  retornar fuentes
```

Los nodos de tránsito (tanques, bombas, válvulas, distribuidores) no son fuentes: el BFS los atraviesa y sigue. El estado "reducido" de una fuente (acueducto a 830 m³/h) la excluye del conjunto: sigue existiendo en el grafo pero no cuenta como fuente activa.

### 3.2 Mutaciones de escenario

| Acción | Efecto sobre el grafo | Uso |
|---|---|---|
| `falla` | Elimina el nodo y todas sus aristas incidentes | Perforación fuera de servicio (Los Cactus, Las Talas) |
| `cierre` | Marca `cerradas` las aristas de la válvula | Corte de válvula (sector este, ramal zona alta) |
| `apertura` | Marca `abiertas` las aristas de la válvula | Maniobra de mitigación (interconexiones de emergencia) |
| `reduccion` | Estado `reducido` en la fuente (caudal nuevo, no cuenta como activa) | Acueducto Sanagasta 2.200 → 830 m³/h |

### 3.3 Semántica de severidad por barrio

Con `base = fuentes(barrio, G_base)` y `esc = fuentes(barrio, G_mutado)`:

- `esc = ∅` → **sin_servicio** (perdió TODAS sus rutas de alimentación).
- `base ⊆ esc` → **normal** (no perdió ninguna fuente).
- resto (perdió ≥ 1 fuente pero conserva ≥ 1) → **baja_presión**.

Esta regla es la que hace falsable a H1: la severidad reportada en diciembre 2024 debe surgir de la topología, no de una tabla cargada a mano.

### 3.4 Métricas por escenario (fórmulas y supuestos explícitos)

Todas las constantes son **supuestos parametrizables** (se cambian en `data/red-la-rioja.json` y el motor no toca código):

```
usuariosSinServicio = Σ usuarios(barrios sin_servicio)
usuariosBajaPresion = Σ usuarios(barrios baja_presión)

déficitM3 = (usuariosSinServicio × 1,0 + usuariosBajaPresion × 0,5)
            × 0,2 m³/persona/día × duraciónDías
            [factor 0,5 en baja presión: reciben algo de agua; duración default 48 h]

viajesCamion   = ceil(déficitM3 / 12 m³ por cisterna)
costoMitigacionARS = viajesCamion × 250.000 $/viaje
camionesRequeridos = ceil((déficitM3 / duraciónDías) / (12 m³ × 8 viajes/día/camión))
                     [supuestos calibrados para reproducir la suba real 7 → 15]

severidadAgregada = (usuariosSinServicio + 0,5 × usuariosBajaPresion) / usuariosTotalesModelados
```

### 3.5 Ranking de alternativas

1. Tomar el escenario base (ej. combinado) y enumerar los **K ≤ 10** nodos candidatos a maniobra (aperturas/cierres de válvulas, incluida la opción "sin maniobra").
2. Correr el motor sobre cada variante.
3. Ordenar **ascendente** por `costoMitigacionARS`; desempate por déficit m³ y luego por severidad agregada.
4. Devolver tabla comparativa + mejor alternativa.

### 3.6 Complejidad computacional

- BFS por barrio: **O(V+E)**.
- Escenario (todos los barrios): **O(V+E)** — la cantidad de barrios es una constante del modelo.
- Ranking: **K × O(V+E)**, K ≤ 10.
- Memoria: **O(V+E)**.
- En la red modelada (44 nodos, 48 aristas): recomputación completa en el orden de **0,2 ms**; la simulación completa de un escenario con ranking queda por debajo de 5 ms.

## 4. Justificación de decisiones técnicas

- **Por qué grafos:** el problema tiene nodos (perforaciones, tanques, válvulas, bombas, barrios), conexiones (cañerías), flujo (fuente → consumidor) y propagación (una falla avanza aguas abajo). El grafo dirigido es el modelo natural del dominio, no una forzada. SIA-UNLaR ya nos dio experiencia con grafos (procedencia en SurrealDB), pero acá no hay grafo de datos: hay grafo de infraestructura.
- **Por qué dirigido:** el agua fluye en un sentido definido por presión y bombeo; una cañería no es reversible. Toda conexión alternativa es una interconexión explícita, modelada como válvula de emergencia con sus propias aristas (cerradas por defecto, como en la operación real).
- **Por qué la IA está subordinada:** una decisión crítica —cortar un barrio para preservar la presión de otros— no se improvisa con un LLM: no es reproducible, no garantiza coherencia con la topología y no produce costos verificables. CASCADE decide por cómputo determinista y la IA solo redacta la explicación del resultado (una llamada one-shot, fallback determinístico siempre activo). La IA nunca entra en el camino de la decisión.

## 5. Decisiones conscientes (documentadas para el jurado)

1. **(a) No se implementa "recalcular solo el subgrafo afectado" como optimización.** Es una decisión circular: el recorrido ES el algoritmo, y "el subgrafo afectado" ya es lo que el BFS inverso visita. Se reemplaza por un micro-benchmark honesto: recomputación completa de la red (~50 nodos) en el orden de 0,2 ms. La incrementalidad para grafos a escala de millones de aristas queda documentada como trabajo futuro.
2. **(b) Sin max-flow / cortes mínimos en el MVP.** Resuelven optimización de capacidad (¿cuánto puedo mandar por esta red?), no la pregunta de CASCADE (¿qué consumidores pierden sus fuentes y a qué costo?).
3. **(c) El tiempo de restablecimiento es un dato operacional** cargado de los eventos reales (Los Cactus: ~48 h reportadas), no se computa del grafo.
4. **(d) No se simula hidráulica** (presión real, física del flujo). CASCADE estima alcance y severidad para priorizar mitigación. Respuesta preparada si el jurado pregunta por presión: ver 04-demo-pitch.md, §4.
5. **(e) La genericidad (agua/energía/gas/logística) es trabajo futuro.** El demo es exclusivamente la red de agua de La Rioja; la genericidad se vende como una línea de visión, no como una promesa de la demo.
