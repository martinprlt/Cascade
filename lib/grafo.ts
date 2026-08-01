import * as fs from "node:fs";
import * as path from "node:path";
import { DatosCascade, Mutacion, RedDeAgua } from "./types";

const RUTA_DATOS_DEFAULT = path.join("data", "red-la-rioja.json");

export function cargarDatosCascade(rutaRelativa = RUTA_DATOS_DEFAULT): DatosCascade {
  const ruta = path.resolve(process.cwd(), rutaRelativa);
  const texto = fs.readFileSync(ruta, "utf-8");
  return JSON.parse(texto) as DatosCascade;
}

export function redBase(datos: DatosCascade): RedDeAgua {
  return {
    nodos: datos.nodos.map((n) => ({ ...n })),
    aristas: datos.aristas.map((a) => ({ ...a })),
  };
}

export function aplicarMutaciones(red: RedDeAgua, mutaciones: Mutacion[]): void {
  const nodosMap = new Map(red.nodos.map((n) => [n.id, n]));
  for (const m of mutaciones) {
    const nodo = nodosMap.get(m.nodo);
    if (!nodo) throw new Error(`Mutación apunta a nodo inexistente: ${m.nodo}`);
    switch (m.accion) {
      case "falla":
        nodo.estado = "fallado";
        for (const a of red.aristas) {
          if (a.from === m.nodo || a.to === m.nodo || a.viaValvula === m.nodo) {
            a.estado = "cerrada";
          }
        }
        break;

      case "cierre":
        nodo.estado = "cerrado";
        for (const a of red.aristas) {
          if (a.viaValvula === m.nodo || (a.from === m.nodo && nodo.tipo === "valvula") || (a.to === m.nodo && nodo.tipo === "valvula")) {
            a.estado = "cerrada";
          }
        }
        break;

      case "apertura":
        nodo.estado = "activo";
        for (const a of red.aristas) {
          if (a.viaValvula === m.nodo || (a.from === m.nodo && nodo.tipo === "valvula") || (a.to === m.nodo && nodo.tipo === "valvula")) {
            a.estado = "abierta";
          }
        }
        break;

      case "reduccion":
        nodo.estado = "reducido";
        if (m.caudalHorarioM3 !== undefined) nodo.caudalHorarioM3 = m.caudalHorarioM3;
        break;

      default:
        throw new Error(`Acción de mutación desconocida: ${(m as Mutacion).accion}`);
    }
  }
}
