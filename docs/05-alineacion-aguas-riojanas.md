# CASCADE — Alineación con Aguas Riojanas (jurado institucional)

Contexto: la exposición "Rumbo Tecnológico de Aguas Riojanas S.A.U. — Redes de Agua Inteligentes" (Ing. Roberto Valle, Gerente General) se presentó durante el evento. Usar este documento para construir el discurso frente al jurado institucional y para responder preguntas.

## 1. Qué dice la presentación de Aguas Riojanas (slides clave)

| Slide | Qué plantean | Cómo lo tocamos con CASCADE |
|---|---|---|
| 2. El desafío del agua | Redes complejas, cambio climático, decisiones en tiempo real | CASCADE es una herramienta de decisión: simula escenarios ANTES de ejecutar |
| 3. Experiencias internacionales | Singapur: gemelo digital + IA; Israel: optimización hídrica; Australia: gestión predictiva | CASCADE es el "simulador de escenarios" que esas redes ya usan, aplicado a Capital hoy |
| 5. Gemelo Digital | Integra redes, tanques, perforaciones, bombas, válvulas + **simulación de escenarios y fallas** | Esa es literalmente la función de CASCADE (ver §2) |
| 6. Telemetría e IoT | Presión, caudal, nivel de tanques, estado de bombas | CASCADE está diseñado para consumir esos datos cuando existan; no los requiere para funcionar (trabaja con GIS/catastro + supuestos explícitos) |
| 7. Hoja de ruta | Corto: GIS, catastro, telemetría crítica. Mediano: sensores, tableros, analítica. Largo: Gemelo Digital, IA, mantenimiento predictivo | CASCADE ES la capa de simulación de su rumbo de largo plazo, funcionando hoy sin esperar a la telemetría |

## 2. El argumento central ("el puente al gemelo digital")

Su propia presentación dice que el Gemelo Digital integra "simulación de escenarios y fallas". CASCADE es exactamente esa capa:

- No necesita SCADA, sensores ni telemetría: usa el grafo de la red (GIS/catastro) y supuestos parametrizables.
- Cuando la telemetría llegue (su hoja de ruta de mediano plazo), el motor la consume sin rediseño: los supuestos se reemplazan por datos reales.
- No compite con su roadmap: es el paso que demuestra que la simulación de impacto funciona ANTES de la infraestructura de sensores.

Frase clave para el pitch: "Ustedes lo plantearon esta mañana: el rumbo es el gemelo digital con simulación de escenarios y fallas. CASCADE es esa capa, ya funcionando, validada contra el evento de diciembre de 2024 que ustedes mismos gestionaron."

## 3. Por qué el caso de estudio les pega directo

- Todas las notas del evento de diciembre 2024 (fuentes F1–F4) citan al Ing. Roberto Valle, gerente general: el caso es parte de la memoria operativa de la propia empresa.
- Evento real: perforación Av. Los Cactus fuera de servicio (17/12/2024) → Procrear, Néstor Kirchner (parte alta) y Las Talas (parte alta) sin servicio; 9 barrios con baja presión; ~48 h de reparación; flota de camiones aguateros 7 → 15.
- CASCADE reproduce el evento con recall 1.0: la severidad (sin agua vs baja presión) EMERGE de la topología del grafo, no de una tabla cargada a mano.
- Acueducto Sanagasta 2.200 → 830 m³/h: escenario "reducción de fuente" modelado (esc-02).

## 4. Respuestas preparadas para preguntas del jurado institucional

**"¿Tienen datos reales?"** — Los de acceso público: el evento de diciembre 2024 (barrios, camiones 7→15, caudales del acueducto Sanagasta), infraestructura declarada (1.050 km de cañerías, cobertura 97%). Los valores por barrio son supuestos explícitos y parametrizables, listados en docs/02-modelo-red.md — se cambian en un JSON, el motor no toca código.

**"¿Esto no es un gemelo digital?"** — Es la capa de simulación de un gemelo digital, funcionando sin sensores. El gemelo completo requiere telemetría, GIS maduro y catastro hidráulico: esa es la hoja de ruta de Aguas Riojanas y CASCADE está diseñado para ser consumido por ella.

**"¿Un grafo puede modelar presión hidráulica?"** — No, y no lo pretendemos: CASCADE estima ALCANCE (qué barrios se afectan, cuántos usuarios, cuántos m³, cuánto cuesta mitigar) para PRIORIZAR decisiones. La física hidráulica (EPANET y similares) vendrá con los datos de telemetría; nuestro motor está estructurado para consumirlos.

**"¿Por qué simular en vez de medir?"** — Porque la medición te dice qué pasó; la simulación te dice qué pasaría ANTES de cortar un barrio. El operador actual decide por reclamos y experiencia (así se manejó diciembre 2024); CASCADE le permite comparar K alternativas y elegir la de menor impacto en milisegundos.

**"¿Esto sirve solo para agua?"** — El modelo es de dominio independiente: un grafo es un grafo, con nodos, conexiones, flujo y propagación. El mismo motor con otros datos y otros supuestos aplica a gas, energía o logística. Pero lo que construimos y validamos hoy es el caso de estudio: la red de La Rioja. La generalización es una línea de visión, no una promesa de la demo.

**"¿Y cuando tengan telemetría real?"** — Mejor: los supuestos se reemplazan por datos reales y el ranking de alternativas se vuelve recomendación operativa en tiempo real.

## 5. Datos de contexto citables (tener a mano en la demo)

- Acueducto Sanagasta: nominal 2.200 m³/h; en diciembre 2024 cayó a 830 m³/h (dique Los Sauces, bajante histórica).
- Perforaciones en servicio/refuerzo: Plaza del Pesebre, Cochangasta, UNLaR, Colegio Médico, Municipal, Copegraf, Lawn Tenis, Las Talas, Circunvalación (Cerro de la Cruz), Parque de la Ciudad, Parque de la Familia, Av. Los Cactus.
- Red Capital: ~1.050 km cañerías de agua potable, cobertura 97% (cloacas: 770 km, 85%). Empresa estatal creada por Ley Provincial 8707 (2010). Opera en Capital, Chilecito, Aimogasta, Chamical y Olta.
- Acueducto Zona Este (2022, ENOHSA): 8.000 vecinos, ~2.500 lotes, ~6 km de cañerías; barrios Yacampis, La Rodadera, Centro Comercial.
- WhatsApp oficial para reclamos: 3804-55-1200; mapa de cortes programados actualizado diariamente.

## 6. Estrategia de pitch — 3 minutos con enfoque institucional

Esta es la versión del pitch calibrada para el jurado de Aguas Riojanas (complementa la versión base de docs/04-demo-pitch.md). Cambios clave vs el guion genérico: se abre con el gancho de la presentación de hoy, el problema se cuenta como "reproducción de un evento que ustedes vivieron", y el cierre aterriza en su hoja de ruta (gemelo digital) sin prometer nada que no esté construido.

### La lógica de los 6 bloques (180 segundos)

| Bloque | Tiempo | Objetivo |
|---|---|---|
| 1. Gancho ("ustedes lo dijeron hoy") | 15 s | Conexión inmediata con el jurado institucional; demuestra que escuchamos las charlas del día (marca "pensar antes de promptear") |
| 2. Problema (diciembre 2024) | 25 s | Contado como evento real que la empresa gestionó: Los Cactus, Sanagasta, camiones 7→15, decisiones a ojo |
| 3. Decisión de scope | 15 s | "Construimos UNA cosa y dejamos afuera esto por esto" — habla con el criterio de Sorroche |
| 4. Demo en vivo | 60 s | El 33% del pitch. Escenarios pre-horneados, cero improvisación |
| 5. Evidencia (recall 1.0 + tests) | 25 s | El diferencial que ningún otro equipo tiene: validación contra el evento real + unit + Playwright + k6 |
| 6. Cierre (3 cifras + puente al gemelo + identidad del motor) | 20 s | Cifras grandes + "cuando llegue la telemetría, este motor la consume" + una línea de identidad: es un motor, no una app de agua + ODS 6, 9, 12 |

Total: ~160 s → quedan 20 s de margen para respiraciones y pausas. Nunca llegar al tope.

### Guion textual (decir literalmente)

**1. Gancho (15 s)**
"Ayer a la tarde, Roberto Valle nos contó cuál es el rumbo: redes inteligentes, gemelo digital, simulación de escenarios y fallas. Nosotros decidimos no esperar a ese futuro: construimos esa capa hoy."

**2. Problema (25 s)**
"Diciembre de 2024. El acueducto de Sanagasta pasa de 2.200 a 830 metros cúbicos por hora. Cae la perforación de Av. Los Cactus: tres barrios sin agua, nueve con baja presión, y los camiones aguateros pasan de 7 a 15. Y las decisiones se toman a ojo: por reclamos, por experiencia, con un mapa de cortes actualizado a mano. Nadie puede responder '¿qué pasa si cierro esta válvula?' antes de ejecutarla."

**3. Scope (15 s)**
"Decidimos construir una sola cosa: un motor que propaga el impacto de una decisión sobre la red y compara alternativas. Dejamos afuera login, telemetría, y que la IA decida. La IA acá solo explica; la decisión se computa."

**4. Demo (60 s) — ir mostrando mientras se habla**
"Esta es la red de Capital modelada como grafo, con los barrios y las perforaciones reales. [Toggle Los Cactus] Simulo la falla de Los Cactus: 3 barrios sin servicio, 9 con baja presión, 2.900 usuarios, 2.880 metros cúbicos de déficit, 60 millones de pesos de mitigación, 15 camiones. Exactamente lo que pasó en diciembre. [Pantalla ranking] Ahora comparo alternativas: abro esta interconexión de emergencia… esta maniobra cuesta 48 millones y reduce el déficit a 2.300 metros cúbicos. El sistema no te dice qué hacer: te muestra el impacto de cada opción antes de ejecutarla."

**5. Evidencia (25 s)**
"Lo validamos contra el evento real: los 12 barrios que se reportaron en diciembre son exactamente los 12 que predice el modelo. Recall del 100 por ciento. Y no cargamos el resultado a mano: la severidad emerge de la topología de la red. Lo probamos como se debe: tests unitarios sobre el motor, Playwright sobre el flujo completo, y una prueba de carga: cada simulación responde en menos de 100 milisegundos."

**6. Cierre (20 s)**
"Tres números: 12 barrios predichos, 2.880 metros cúbicos de déficit cuantificados, 60 millones de pesos de mitigación dimensionada. Cuando la telemetría de su hoja de ruta llegue, este motor la consume sin rediseño. Y no es una app de agua: es un motor para infraestructuras críticas modeladas como grafos — el mismo modelo aplica a gas, energía o logística, lo que cambia es el dato. CASCADE es la capa de simulación del gemelo digital, funcionando hoy: agua limpia, innovación y producción responsable. Gracias."

Por qué la generalización se menciona acá y no antes: en el bloque 3, antes de la demo, una frase "motor para infraestructuras críticas" puede hacer que el jurado institucional piense "¿nos venden algo genérico?" sin haber visto nada. En el cierre, DESPUÉS de que la demo y el recall 1.0 demostraron que el 100% es agua de La Rioja, la misma frase eleva lo que acaban de ver: no era una app, era un motor. El orden hace que la generalización se perciba como identidad, no como fuga de foco.

### Reglas de ejecución

- **Una sola persona habla todo el pitch** (la de mayor soltura). Repartir voces en 3 minutos es difícil de ensayar y arriesga el timing. Los demás operan la demo en pantalla.
- **La demo se opera con toggles pre-horneados, nunca a mano**: cada clic tiene que tener resultado conocido de antemano (valores esperados en data/red-la-rioja.json).
- **Si el problema se pasa de 25 s, se corta del scope (bloque 3), no de la demo.**
- **Si la IA cae o tarda**: no pasa nada, el explicador determinístico es el default y la demo no cambia.
- **La genericidad se menciona, no se promete.** Sí se dice (una sola línea, declarativa, en el cierre): "no es una app de agua, es un motor para infraestructuras críticas — el mismo modelo aplica a gas, energía o logística". Eso es identidad de arquitectura y conecta con el tagline. NO se dice como roadmap ("vamos a hacerlo para gas") ni como feature ni como lista. El demo y la validación son 100% agua de La Rioja.
- **Ensayo obligatorio**: 3 pasadas completas con cronómetro entre 16:30 y 17:00. Si una pasada pasa de 170 s, se recorta el bloque 3 o el 5, nunca el 4 (la demo es lo que se recuerda).
- Si el jurado institucional pregunta al final, usar las respuestas preparadas de la sección 4 de este documento.
