# CASCADE — Identidad y encuadre del proyecto

- **Nombre:** CASCADE
- **Tagline:** Motor de Simulación y Propagación de Impacto para Infraestructuras Críticas — caso de estudio: red de agua de La Rioja.
- **Equipo:** 3 estudiantes de Ingeniería en Sistemas, a ~1 año de recibirse.
- **Presentación:** hackathon "Build La Rioja", pitch de 3 minutos, demo en vivo, evaluación del jurado 17:00.

## 1. Visión

CASCADE le permite a un operador de infraestructura crítica responder **antes** de tocar una válvula: "si falla la perforación X, ¿qué barrios quedan sin agua, cuántos usuarios son, cuántos m³ de déficit, y cuánto cuesta mitigarlo?". La respuesta se **computa**, no se estima a ojo. El motor modela la red como un grafo dirigido, simula el escenario, compara alternativas lado a lado y rankea las maniobras de menor impacto. Es reutilizable en cualquier infraestructura modelable como grafo (agua, energía, gas, logística); el caso de estudio y la demo son exclusivamente la red de agua potable de la ciudad de La Rioja.

## 2. La problemática (diciembre 2024, hecho real)

- El acueducto Sanagasta pasó de **2.200 a 830 m³/h**: perdió más de la mitad de su caudal por la sequía extrema (dique Los Sauces en bajante histórica). La zona oeste fue la más afectada; se entregó agua por turnos, presurizando la red de abajo hacia arriba por los desniveles [F3][F4].
- La perforación de **Av. Los Cactus** falló (17/12/2024): 3 barrios sin servicio (Procrear, Néstor Kirchner parte alta, Las Talas parte alta), 9 con baja presión (Luis Vernet, Susana Quintela, El Mirador, Rivadavia, Circunvalación, Nueva Esperanza, Coop. Santa Rosa, Emp. Telecom, San Cayetano), ~48 horas de reparación, compensación con maniobras desde otros sectores y camiones aguateros [F2].
- La flota de camiones aguateros pasó de **7 a 15** unidades [F4].
- Las decisiones se tomaban **a ojo**: por reclamos de vecinos, experiencia del operador y un mapa de cortes actualizado manualmente. Nadie podía simular "¿qué pasa si…?" antes de ejecutar el corte o la maniobra.

## 3. Pregunta de investigación

> ¿Puede un modelo de propagación en grafo sobre la red de distribución de Capital estimar el alcance (barrios, usuarios, m³/día) de fallas de infraestructura con suficiente fidelidad para priorizar planes de mitigación?

## 4. Hipótesis

- **H1:** ante la falla de la perforación de Av. Los Cactus, el modelo identifica como afectados el **100% de los barrios reportados en diciembre 2024** (3 sin servicio, 9 con baja presión), y el gradiente de severidad (sin agua vs baja presión) correlaciona con la pérdida de rutas de alimentación desde las fuentes: un barrio pierde **TODAS** sus fuentes = sin agua; pierde **algunas** = baja presión.
- **H2:** la comparación exhaustiva de escenarios permite elegir cortes/maniobras que minimizan el **costo de mitigación** (camiones aguateros, $/viaje) mejor que la decisión por experiencia del operador.

## 5. Contrahipótesis (falsabilidad explícita)

> Si el modelo no reproduce el evento de diciembre 2024 (recall < 1.0 en el escenario Los Cactus), no sirve para priorizar mitigación.

La contrahipótesis es verificable en la demo: tabla "predicción vs realidad" con los 12 barrios y recall 1.0. Si un jurado cuestiona la utilidad del modelo, la respuesta es medible, no opinable.

## 6. Qué es CASCADE y qué NO es

| Es… | No es… |
|---|---|
| Motor de simulación determinista sobre un grafo dirigido (fuentes → consumidores). | Un dashboard pasivo: no muestra el pasado, simula futuros posibles. |
| Comparador de escenarios y ranker de alternativas de mitigación. | Una app de IA: la IA solo redacta la explicación de un resultado ya computado; la decisión es 100% determinista. |
| Validado contra un evento real (diciembre 2024, recall 1.0). | Un simulador hidráulico: no calcula presiones reales ni física del flujo. |
| Una decisión de arquitectura defendible frente al jurado (ver 01-arquitectura.md). | Un ERP: no gestiona reclamos, órdenes de trabajo ni facturación. |

## 7. Evolución conceptual: CASCADE

Destilamos conocimiento con modelos y construimos un grafo de procedencia en SurrealDB. Este año damos el paso al revés: **el modelo no opina, calcula**. CASCADE demuestra que sabemos cuándo la IA **no** debe decidir. Una decisión crítica (cortar un barrio para salvar otro) se computa con un algoritmo determinista; la IA queda subordinada, redactando en lenguaje natural lo que el algoritmo ya decidió.

## 8. ODS declarados (máximo 3)

| ODS | Justificación |
|---|---|
| **6 — Agua limpia y saneamiento** | CASCADE reduce el tiempo de respuesta ante fallas de la red de agua potable y dimensiona la mitigación (m³ de déficit, camiones necesarios), acortando cortes como los de diciembre 2024. |
| **9 — Industria, innovación e infraestructura** | Motor de simulación de impacto sobre infraestructura crítica: innovación aplicada a hacer la infraestructura existente más resiliente y planificable. |
| **12 — Producción y consumo responsables** | Al cuantificar déficit y costo de mitigación, se priorizan maniobras que desperdician menos agua y gastan menos recursos (camiones, combustible, horas de operador). |
