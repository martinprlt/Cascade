# CASCADE — Modelo de la red: Capital, La Rioja

Este documento define el grafo que alimenta el motor: nodos, aristas, zonas, el evento de validación de diciembre 2024 y **todos** los supuestos de modelado. Todo lo que figura como "supuesto" está parametrizado en `data/red-la-rioja.json` y puede defenderse número por número ante el jurado.

## 1. Fuentes citadas

| Ref | Fuente | Fecha | Qué aporta |
|---|---|---|---|
| F1 | El Destape — "Perforaciones y distribución estratégica de agua: las claves del plan de obras hídricas" — https://www.eldestapeweb.com/informacion-general/crisis-hiidrica/perforaciones-y-distribucion-estrategica-de-agua-las-claves-del-plan-de-obras-hidricas-que-lleva-adelante-la-rioja-20241219124332 | 19/12/2024 | Listado de perforaciones reales; crisis del acueducto Sanagasta (2.200 → 830 m³/h) |
| F2 | Nueva Rioja — "Aguas Riojanas comunica problemas en la perforación de Av. Los Cactus" — https://nuevarioja.com.ar/sociedad/aguas-riojanas-comunica-problemas-en-la-perforacion-de-av-los-cactus-en-la-zona-sur.htm | 17/12/2024 | Evento de validación: barrios sin servicio y con baja presión; ~48 h de reparación |
| F3 | Nueva Rioja — "Obras esenciales para hacer frente a la grave situación de la Capital por la escasez de agua" — https://nuevarioja.com.ar/sociedad/obras-esenciales-para-hacer-frente-a-la-grave-situacion-de-la-capital-por-la-escasez-de-agua.htm | 17–18/12/2024 | Acueducto Sanagasta; zona oeste como la más afectada |
| F4 | Riojalibre — "Desde Aguas Riojanas informaron que se está brindando asistencia con camiones…" — https://riojalibre.com.ar/desde-aguas-riojanas-informaron-que-se-esta-brindando-asistencia-con-camiones-donde-no-hay-presion-y-se-brinda-agua-por-turnos/ | dic 2024 | Camiones aguateros de 7 a 15; agua por turnos |
| F5 | El Independiente — https://www.elindependiente.com.ar/pagina.php?id=337176 | 2024 | 1.050 km de cañerías, cobertura 97%, red cloacal 770 km (85%), WhatsApp 3804551200 |
| F6 | argentina.gob.ar — "Continúan los trabajos para ampliar la cobertura de agua potable en La Rioja" — https://www.argentina.gob.ar/noticias/continuan-los-trabajos-para-ampliar-la-cobertura-de-agua-potable-en-la-rioja | 2022 | Acueducto Zona Este: 8.000 vecinos, ~2.500 lotes, ~6 km de cañerías, válvulas de desagüe y de aire; barrios Yacampis, La Rodadera, Centro Comercial |
| F7 | Aguas Riojanas (empresa estatal, Ley Provincial 8707/2010) — https://www.aguasriojanas.com.ar/oficial/index.php | — | Operador de Capital, Chilecito, Aimogasta, Chamical y Olta; mapa de cortes programados actualizado a diario |

## 2. Zonas, fuentes y nodos reales

### Zona oeste — la más afectada por la crisis del acueducto [F1][F3]

| Nodo | Tipo | Detalle |
|---|---|---|
| Acueducto Sanagasta | acueducto | Caudal nominal **2.200 m³/h**; en crisis **830 m³/h** (perdió más de la mitad; dique Los Sauces en bajante histórica) |
| Perforación Plaza del Pesebre | perforacion | — |
| Perforación Escuela de Cochangasta | perforacion | — |
| Perforación UNLaR | perforacion | — |
| Perforación Colegio Médico | perforacion | — |
| Perforación Barrio Municipal | perforacion | — |
| Perforación Circunvalación (Cerro de la Cruz) | perforacion | — |
| Perforación Parque de la Ciudad | perforacion | Zona oeste |

### Zona sur

| Nodo | Tipo | Detalle |
|---|---|---|
| Perforación Copegraf (predio, Av. 30 de Septiembre Sur) | perforacion | [F1] |
| Perforación Lawn Tenis | perforacion | [F1] |
| Perforación Las Talas | perforacion | [F1] |
| Perforación Parque de la Familia | perforacion | Zona sur [F1] |
| Perforación Av. Los Cactus | perforacion | **Nodo del evento de validación** [F1][F2] |

### Zona este

| Nodo | Tipo | Detalle |
|---|---|---|
| Acueducto Zona Este | acueducto | 8.000 vecinos, ~2.500 lotes, ~6 km; válvulas de desagüe y de aire [F6] |
| Barrio Yacampis | barrio | [F6] |
| Barrio La Rodadera | barrio | [F6] |
| Barrio Centro Comercial | barrio | [F6] |

### Nodos de infraestructura (supuestos de modelado, no figuran en el reporte)

Tanque Zona Oeste, Tanque Central, Bomba sector Sur, Válvula de cabecera Sanagasta, Válvula sector Av. Los Cactus, Válvula sector Este, Válvula ramal zona alta oeste, Distribuidor zona oeste, Distribuidor zona sur, Distribuidor zona este, Interconexión sur–oeste (emergencia, cerrada), Interconexión sur–este (emergencia, cerrada). La existencia de tanques, bombas y distribuidores en una red como la de Capital es un hecho operativo estándar; la cantidad y ubicación exactas son supuesto del equipo.

## 3. Barrios del evento de diciembre 2024 y estado reportado

| Barrio | Estado reportado [F2] | Estado predicho (esc-01) | Usuarios (supuesto) | m³/día (supuesto) |
|---|---|---|---|---|
| Procrear | sin_servicio | sin_servicio | 1.200 | 240 |
| Néstor Kirchner (parte alta) | sin_servicio | sin_servicio | 900 | 180 |
| Las Talas (parte alta) | sin_servicio | sin_servicio | 800 | 160 |
| Luis Vernet | baja_presion | baja_presion | 950 | 190 |
| Susana Quintela | baja_presion | baja_presion | 700 | 140 |
| El Mirador | baja_presion | baja_presion | 850 | 170 |
| Rivadavia | baja_presion | baja_presion | 1.100 | 220 |
| Circunvalación | baja_presion | baja_presion | 1.300 | 260 |
| Nueva Esperanza | baja_presion | baja_presion | 1.500 | 300 |
| Coop. Santa Rosa | baja_presion | baja_presion | 900 | 180 |
| Emp. Telecom | baja_presion | baja_presion | 250 | 50 |
| San Cayetano | baja_presion | baja_presion | 1.050 | 210 |
| **Totales** | **3 sin / 9 baja** | **3 sin / 9 baja** | **11.500** | **2.300** |

Barrios representativos agregados por el equipo para darle forma a la zona oeste (no figuran en el reporte del evento; **supuestos de modelado**): Barrio Centro (3.500 usuarios, zona centro), Barrio San Nicolás (1.600, oeste), Barrio Don Bosco (1.400, oeste). Total modelado: **20.500 usuarios, 4.100 m³/día**.

## 4. El evento Los Cactus como escenario de validación

El 17/12/2024 [F2]: falla la perforación de Av. Los Cactus → Procrear, Néstor Kirchner (parte alta) y Las Talas (parte alta) quedan **sin servicio**; 9 barrios con **baja presión**; compensación con maniobras desde otros sectores y camiones aguateros; ~48 h de reparación estimada. En el modelo esto es el **escenario esc-01** con la mutación `falla` sobre `perf-los-cactus`. La topología (ver §5) hace que el gradiente de severidad surja del grafo: los 3 barrios sin servicio pierden TODAS sus fuentes (solo los alimentaba Los Cactus), los 9 de baja presión pierden Los Cactus pero conservan Copegraf, Lawn Tenis, Las Talas o Parque de la Familia. Resultado esperado: **recall 1.0** sobre los 12 barrios.

## 5. Diagrama conceptual de la topología (grafo, 44 nodos / 48 aristas)

```
ZONA OESTE (más afectada en dic-2024)
  acu-sanagasta (2.200 → 830 m³/h) ─▶ valvula-sanagasta ─▶ tanque-oeste ─▶ dist-oeste ─┬─ barrio-centro
  7 perforaciones oeste ───────────────────────────────────────────▶ dist-oeste        ├─ tanque-central ─▶ valvula-este ─▶ acu-zona-este ─▶ dist-este ─▶ yacampis / la-rodadera / centro-comercial
  dist-oeste ─▶ valvula-rama-alta ─▶ san-nicolas / don-bosco (ramal alto, solo acueducto) └─ ZONA ESTE (acueducto 2022)

ZONA SUR
  perf-los-cactus ─▶ valvula-cactus ─┬─▶ procrear / nk-alta / las-talas-alta   (línea dedicada: pierden TODO al fallar)
                                     └─▶ dist-sur ─▶ bomba-sur ─▶ 9 barrios sur
  4 perforaciones sur (copegraf, lawn-tenis, las-talas, parque-familia) ─▶ dist-sur

INTERCONEXIONES DE EMERGENCIA (cerradas por defecto)
  dist-oeste ─▶ dist-sur + ramal a procrear / nk-alta / las-talas-alta   (inter-sur-oeste)
  tanque-central ─▶ dist-sur + ramal a procrear / nk-alta / las-talas-alta (inter-sur-este)
```

Regla de lectura del diagrama: la severidad de un barrio depende de cuántas fuentes lo alimentan. Los 3 barrios del ramal dedicado de Los Cactus tienen exactamente una fuente; el resto de la zona sur tiene cinco (Los Cactus + 4 perforaciones de refuerzo).

## 6. Supuestos de modelado (todos parametrizables en `red-la-rioja.json`)

| # | Supuesto | Valor | Unidad | Justificación / origen |
|---|---|---|---|---|
| S1 | Consumo per cápita | 200 | L/persona/día | Valor estándar para consumo doméstico (no publicado por Aguas Riojanas) |
| S2 | Usuarios por barrio | ver §3 | personas | Estimados por cantidad de viviendas/lotes; cifras no publicadas |
| S3 | Duración de falla (default) | 48 | horas | ~48 h reportadas en Los Cactus [F2]; parametrizable por escenario |
| S4 | Factor de severidad en baja presión | 0,5 | — | Un barrio con baja presión recibe parte del servicio; calibrado contra el evento real |
| S5 | Capacidad de cisterna de camión aguatero | 12 | m³/viaje | Valor típico de mercado; supuesto |
| S6 | Costo por viaje de camión aguatero | 250.000 | $ARS/viaje | Estimación del equipo; supuesto |
| S7 | Viajes por camión por día | 8 | viajes | Calibrado para reproducir la flota real del evento (7 → 15 camiones) |
| S8 | Caudal por perforación | 25 | m³/h | Valor típico de perforación de acueducto; supuesto |
| S9 | Caudal Acueducto Zona Este | 150 | m³/h | Supuesto; el dato real es 8.000 vecinos y ~6 km [F6] |
| S10 | Barrios representativos zona oeste | 3 | barrios | Centro, San Nicolás, Don Bosco; agregados para dar topología a la oeste |

**Nota de honestidad:** los números de usuarios y consumo de la ciudad NO están publicados. Por eso todos los valores de usuarios/m³/$ son supuestos explícitos y parametrizables: el valor del modelo está en la propagación (quién queda afectado y en qué grado), no en el dígito exacto de usuarios. Si el jurado cuestiona un número, se cambia el JSON y se re-simula en segundos: esa es la defensa.
