---
name: cascade-graph-simulator
description: Guía y reglas para desarrollar, simular y mutar el motor determinista de propagación en grafos (BFS inverso), cálculo de métricas operacionales y ranking de alternativas para la red de agua de La Rioja.
---

# CASCADE — Skill: Motor de Simulación en Grafos (`cascade-graph-simulator`)

Esta skill proporciona las reglas de desarrollo y especificación técnica para extender, auditar o modificar el **motor determinista de propagación en grafos** de CASCADE.

## 📐 Reglas de Oro de Arquitectura

1. **La función es pura y determinista:** Mismo input de grafo y mutación → Mismo resultado, siempre. Sin I/O, sin llamadas asíncronas y sin efectos secundarios.
2. **La IA NO entra en la decisión:** El motor calcula las fuentes y la severidad mediante cómputo en TypeScript (`lib/motor.ts`). La IA se limita a explicar el resultado ya computado.
3. **Falsabilidad Obligatoria (Recall 1.0):** Cualquier modificación en la topología o algoritmos DEBE mantener el 100% de Recall (12/12 barrios) contra el evento real de diciembre 2024 en `esc-01`.

---

## 🔁 Algoritmo Principal: BFS Inverso (`lib/motor.ts`)

Para determinar qué fuentes alimentan a cada barrio:
```ts
export function fuentesDe(red: RedDeAgua, nodoId: string): Set<string> {
  const visitados = new Set<string>();
  const fuentes = new Set<string>();
  const cola: string[] = [nodoId];

  while (cola.length > 0) {
    const n = cola.shift() as string;
    if (visitados.has(n)) continue;
    visitados.add(n);

    const nodo = red.nodos.find((x) => x.id === n);
    if (!nodo) continue;

    if (
      (nodo.tipo === "perforacion" || nodo.tipo === "acueducto") &&
      nodo.esFuente !== false &&
      nodo.estado === "activo"
    ) {
      fuentes.add(nodo.id);
      continue;
    }
    if (nodo.estado === "fallado") continue;

    for (const a of red.aristas) {
      if (a.to === n && a.estado === "abierta" && !visitados.has(a.from)) {
        cola.push(a.from);
      }
    }
  }
  return fuentes;
}
```

---

## 📊 Semántica de Severidad

* 🔴 **`sin_servicio`:** `fuentes_escenario.size === 0` (perdió el 100% de sus rutas de alimentación).
* 🟠 **`baja_presion`:** Perdió al menos 1 fuente, pero conserva al menos 1 activa (`base.some(f => !esc.has(f))` y `esc.size > 0`).
* 🟢 **`normal`:** Conserva el 100% de sus fuentes originales.

---

## 💰 Fórmulas de Métricas Operacionales (`lib/metricas.ts`)

Todas las constantes se parametriza desde `data/red-la-rioja.json`:

* `déficitM3 = (usuariosSinServicio * 1.0 + usuariosBajaPresion * 0.5) * (0.2 m³/persona/día) * (duracionHoras / 24)`
* `viajesCamion = ceil(déficitM3 / 12 m³)`
* `costoMitigacionARS = viajesCamion * 250.000 $/viaje`
* `camionesRequeridos = ceil((déficitM3 / duracionDias) / (12 m³ * 8 viajes/día))`

---

## 🧪 Verificación de Cambios

Tras realizar modificaciones en `lib/motor.ts`, `lib/metricas.ts`, `lib/escenarios.ts` o `data/red-la-rioja.json`, ejecuta:

```bash
npm test
```
Verifica que los 12 tests unitarios en `tests/motor.spec.ts` pasen exitosamente.
