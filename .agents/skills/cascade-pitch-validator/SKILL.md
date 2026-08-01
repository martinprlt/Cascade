---
name: cascade-pitch-validator
description: Guion de 3 minutos, auditoría de tiempos de demo y simulador de preguntas para la defensa ante el jurado institucional de Aguas Riojanas.
---

# CASCADE — Skill: Auditoría de Pitch & Jurado (`cascade-pitch-validator`)

Esta skill proporciona el guion estricto de 3 minutos (180 segundos) calibrado para la presentación oficial y un simulador de Q&A para defender la arquitectura ante el jurado institucional.

## ⏱️ Estructura del Pitch (180 Segundos)

| Bloque | Tiempo | Frase Clave / Contenido |
|---|---|---|
| **1. Gancho** | 15 s | *"Ayer nos contaron cuál es el rumbo: redes inteligentes, gemelo digital, simulación de escenarios y fallas. Nosotros construimos esa capa hoy."* |
| **2. Problema** | 25 s | *"Diciembre de 2024. El acueducto Sanagasta pasa de 2.200 a 830 m³/h. Cae Los Cactus: 3 barrios sin agua, 9 con baja presión, camiones de 7 a 15, y decisiones a ojo."* |
| **3. Scope** | 15 s | *"Construimos una sola cosa: un motor determinista que propaga el impacto y compara alternativas. Dejamos afuera login e hidráulica; la decisión se computa."* |
| **4. Demo en Vivo** | 60 s | Alternar `esc-01` (Los Cactus) → mostrar métricas gigantes → alternar a `esc-05` (Ranking de Maniobras de menor costo). |
| **5. Evidencia** | 25 s | *"Recall del 100% contra los 12 barrios del evento real. Probado con unit tests, Playwright y p95 < 100 ms en k6."* |
| **6. Cierre** | 20 s | *"12 barrios predichos, $33M de ahorro en la maniobra óptima, 15 camiones del evento real reproducidos. CASCADE es la capa de simulación del gemelo digital, funcionando hoy."* |

---

## 🏛️ Respuestas Preparadas para el Jurado Institucional

### ❓ "¿Tienen datos reales o son inventados?"
> *"Usamos las 7 fuentes públicas del evento real (notas de prensa, caudales de Sanagasta y listado de perforaciones). Los valores por barrio son supuestos explícitos parametrizados en `data/red-la-rioja.json`: se cambian en un JSON y el motor simula en milisegundos."*

### ❓ "¿Un grafo puede calcular presión hidráulica?"
> *"No, y es una decisión consciente. La presión hidráulica requiere EPANET y telemetría de cotas. CASCADE responde una pregunta anterior: alcance de la falla y costo de mitigación. Se calcula con topología en 0,2 milisegundos."*

### ❓ "¿Por qué no dejar que la IA tome la decisión?"
> *"Una decisión crítica (cortar un barrio para salvar otro) no se improvisa con un LLM. CASCADE decide por algoritmo determinista de propagación en grafo. La IA se limita a redactar la explicación en lenguaje natural como un extra."*

### ❓ "¿Por qué simular si podemos medir con telemetría?"
> *"La medición te dice qué pasó; la simulación te permite saber qué pasaría ANTES de tocar una válvula."*
