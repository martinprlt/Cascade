# CASCADE — Demo y pitch: guiones operativos

Este documento es para leerlo a las 09:30 del sábado y ejecutarlo sin pensar. El demo dura ~90 segundos dentro de un pitch de 3 minutos (180 segundos). Calibración: cronómetro en mano desde el primer ensayo.

## 1. Guion del demo (90 segundos, paso a paso)

Material: laptop con el proyecto en `localhost:3000`, ventana a pantalla completa, 4 pestañas abiertas antes de empezar (dashboard, simular, comparar, este documento). Nadie teclea durante el pitch salvo los toggles.

| Tiempo | Pantalla | Qué se toca | Qué se dice (en ~1 línea) |
|---|---|---|---|
| 0–15 s | 1. Red | Zoom al grafo (React Flow) | "Esta es la red de agua de Capital: 44 nodos reales —perforaciones, tanques, válvulas, barrios—, las mismas fuentes que en la prensa de diciembre del año pasado." |
| 15–45 s | 2. Simulador | Toggle: **"falla perforación Av. Los Cactus"** → esperar propagación (~0,2 ms) → el grafo se colorea (rojo = sin servicio, naranja = baja presión) | "Hacemos una pregunta antes de tocar nada: ¿qué pasa si falla Los Cactus? El motor propaga por el grafo y colorea: 3 barrios sin servicio, 9 con baja presión." |
| 45–60 s | 2. Simulador | Apuntar a las 3 métricas grandes | "2.900 usuarios sin servicio, 2.880 m³ de déficit en 48 horas, y para mitigarlo: 15 camiones aguateros. Los 15 reales del evento." |
| 60–90 s | 3. Comparación | Tabla diff de los 5 escenarios + ranking "alternativa de menor impacto" | "Comparamos 5 escenarios lado a lado. En el combinado, el ranking elige la maniobra de menor impacto: reabrir el sector este más la interconexión sur-oeste — $48 millones contra $81 millones sin maniobra. La decisión la toma el algoritmo, no una opinión." |
| 90–100 s | 3. Explicador | Mostrar el panel de texto (determinístico o IA, da igual cuál) | "Y si querés el porqué en lenguaje natural, el explicador lo redacta. Pero si la IA falla, el texto determinístico es el que queda: el modelo no opina, calcula." |

Contingencia de tiempo: si el jurado interrumpió y vas atrasado, saltás la pantalla 1 (el grafo se ve igual en la pantalla 2).

## 2. Guion del pitch (3 minutos, 180 s, calibrado)

| Bloque | Duración | Contenido |
|---|---|---|
| Problema | 30 s | Dic-2024: acueducto Sanagasta de 2.200 a 830 m³/h; falla la perforación de Los Cactus; 3 barrios sin agua y 9 con baja presión; decisiones a ojo (reclamos + experiencia + mapa manual); camiones de 7 a 15. |
| Decisión de scope | 20 s | Qué dejamos afuera y por qué: sin login, sin telemetría en vivo, sin hidráulica; el motor responde una sola pregunta bien: "¿qué alcance tiene esta falla y cuánto cuesta mitigarla?". |
| Demo | 60 s | Guion de §1, recortado a lo esencial (red → falla Los Cactus → métricas → comparación → ranking). |
| Cómo lo construimos | 30 s | Frontend maquetado con v0 y shadcn; las horas humanas fueron al motor: algoritmo determinista sobre un grafo de 44 nodos, IA subordinada con fallback: "el modelo no opina, calcula". |
| Cómo lo probamos | 20 s | Unit del motor contra el fixture del evento real; Playwright (3 flujos); k6 con p95 < 100 ms; y la prueba que importa: recall 1.0 contra el evento de diciembre 2024. |
| Cierre | 20 s | 3 cifras grandes: 12/12 barrios (recall 1.0), la mejor maniobra cuesta $48M en vez de $81M (**$33M de ahorro**), 15 camiones reales reproducidos. ODS 6, 9 y 12. Futuro: PULSO RIOJANO — horario de bombeo cruzando tarifa eléctrica y nivel de acuífero. |

Total: 180 s exactos. El cierre debe sonar ANTES de que el cronómetro marque 3:00.

## 3. Frases textuales sugeridas (rioplatense, para decir literalmente)

**Problema:**
> "En diciembre del año pasado La Rioja se quedó sin agua de golpe. El acueducto de Sanagasta pasó de 2.200 a 830 metros cúbicos por hora, se cayó la perforación de Los Cactus, y 3 barrios quedaron sin servicio y 9 con baja presión. ¿Cómo se decidía qué hacer? A ojo: por los reclamos de los vecinos y la experiencia del operador. Los camiones aguateros saltaron de 7 a 15. Eso se puede calcular antes."

**Scope:**
> "Arrancamos acotando: sin login, sin telemetría en vivo, sin hidráulica. El motor hace una sola cosa y la hace bien: dado un grafo de la red, simular una falla y decir qué barrios pierden qué y cuánto cuesta mitigarlo."

**Demo (paso 2):**
> "Tildamos 'falla la perforación Av. Los Cactus'. El motor propaga por el grafo y colorea: rojo sin servicio, naranja baja presión. Los mismos 12 barrios del evento real, en milisegundos."

**Evidencia:**
> "El modelo reproduce el evento de diciembre con recall 1.0: 12 de 12 barrios. Y ojo: si no lo reproducía, no servía para nada — eso está escrito como contrahipótesis en nuestros documentos."

**IA subordinada:**
> "La IA no decide nada. Decide un algoritmo determinista que podés re-ejecutar mil veces y da siempre lo mismo. La IA, si anda, te explica el resultado en lenguaje natural; si no anda, hay un texto determinístico que es el default. El modelo no opina, calcula."

**Cierre:**
> "Tres cifras: 12 de 12 barrios correctos contra el evento real; la mejor maniobra cuesta 48 millones de pesos contra 81 de no hacer nada — 33 millones de ahorro, 41 por ciento menos; y los 15 camiones reales que usó Aguas Riojanas, reproducidos por el modelo. Agua limpia, infraestructura resiliente, menos desperdicio: ODS 6, 9 y 12. Y el próximo paso ya lo tenemos: PULSO RIOJANO, recomendando horarios de bombeo cruzando la tarifa eléctrica y el nivel del acuífero."

## 4. Fallbacks y blindajes de la demo

| Riesgo | Respuesta preparada |
|---|---|
| LLM caído / no responde | Nada cambia: el explicador determinístico es el **default real**. La frase del demo ya contempla ambos casos ("si la IA falla, el texto determinístico es el que queda"). |
| Sin internet en el venue | El demo corre 100% en localhost: el frontend, el motor y los tests son locales. La única llamada de red es al LLM, y es prescindible por diseño. |
| "¿Los datos son reales?" | Sí, de prensa verificada, con las 7 fuentes citadas en 02-modelo-red.md. Los números de usuarios y $ son supuestos explícitos, parametrizables: se cambian en el JSON y se re-simula en segundos. |
| "¿Por qué no calculan presión real? No es un simulador hidráulico." | Respuesta honesta: "Correcto, y es una decisión consciente: la presión real requiere hidráulica (EPANET, datos de caudal y cota que no están publicados). Nosotros resolvemos una pregunta anterior: qué alcance tiene una falla y qué maniobra minimiza el costo de mitigación. Eso se responde con topología, en 0,2 milisegundos." |
| k6 no corre en vivo (no hay time / falla el binario) | No se demuestra en vivo: se muestra la evidencia pre-grabada (screenshot del summary con p95 < 100 ms) en una pestaña. Lo mismo aplica a Playwright. |
| "¿Y si el grafo está mal?" | La topología está validada contra el evento real (recall 1.0) y las fuentes están citadas. Cambiar topología = cambiar JSON, no código. |
| Se rompe algo en vivo | Regla del equipo: no se improvisa en el escenario. Se dice "esto lo mostramos en el registro de tests" y se sigue con la tabla de validación. |

## 5. Checklist final del día (tachar antes de las 16:30)

- [ ] Problema en una frase, memorizada (frase de §3).
- [ ] Qué dejamos afuera y por qué, en una frase.
- [ ] 3 métricas gigantes en pantalla, con números verificados contra el JSON.
- [ ] Demo corrió de punta a punta **3+ veces seguidas** sin tocar nada.
- [ ] Fallback del explicador probado (LLM apagado → texto determinístico).
- [ ] Tests en verde: `motor.spec.ts`, Playwright (3 paths), k6 (p95 < 100 ms).
- [ ] Tabla de validación predicción vs realidad visible (recall 1.0).
- [ ] ODS 6, 9 y 12 nombrados en el cierre.
- [ ] Pitch ensayado con cronómetro: demo ≤ 90 s, total ≤ 180 s.

## 6. Cronograma del sábado (horario del hackathon)

| Hora | Bloque | Quién |
|---|---|---|
| 09:30 | Acreditaciones | Todo el equipo |
| 10:10 | Inicio del desafío | Todo el equipo |
| 10:10–10:40 | Definición final y confirmación de datos (números y topología congelados en el JSON) | Todo el equipo |
| 10:40–11:30 | Datos + grafo + motor + unit tests | 1 persona |
| 10:40–12:30 | Frontend con v0 (en paralelo) | 2 personas |
| 12:30–13:00 | Integración frontend ↔ motor | Todo el equipo |
| 13:00–15:00 | Almuerzo | Todo el equipo |
| 15:00–15:40 | Escenarios + validación + explicador | Todo el equipo |
| 15:40–16:00 | Pruebas manuales (5+ recorridos) | Todo el equipo |
| 16:00–16:20 | Playwright + k6 | Todo el equipo |
| 16:20–16:30 | Pulido de métricas ($) y tabla de validación | 1 persona |
| 16:30–17:00 | Ensayo del pitch con cronómetro (2 pasadas completas) | Todo el equipo |
| 17:00 | Demo ante el jurado | Todo el equipo |
| 18:00 | Cierre | — |
