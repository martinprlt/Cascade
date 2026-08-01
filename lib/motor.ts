import { RedDeAgua, Severidad } from "./types";

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

export function severidadPorBarrio(redBase: RedDeAgua, redMutada: RedDeAgua): Record<string, Severidad> {
  const resultado: Record<string, Severidad> = {};
  for (const nodo of redBase.nodos) {
    if (nodo.tipo !== "barrio") continue;
    const base = fuentesDe(redBase, nodo.id);
    const esc = fuentesDe(redMutada, nodo.id);
    let severidad: Severidad;
    if (esc.size === 0) {
      severidad = "sin_servicio";
    } else if ([...base].every((f) => esc.has(f))) {
      severidad = "normal";
    } else {
      severidad = "baja_presion";
    }
    resultado[nodo.id] = severidad;
  }
  return resultado;
}
