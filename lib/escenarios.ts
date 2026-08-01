import { DatosCascade, Mutacion, ResultadoSimulacion } from "./types";
import { aplicarMutaciones, redBase } from "./grafo";
import { severidadPorBarrio } from "./motor";
import { calcularMetricas } from "./metricas";
import { explicarResultado } from "./explicador";

export function duracionFalla(datos: DatosCascade, horas?: number): number {
  return horas ?? datos.supuestos.duracionFallaHoras ?? 48;
}

export function simularEscenario(
  datos: DatosCascade,
  escenarioId: string,
  duracionHoras?: number
): ResultadoSimulacion {
  const escenario = datos.escenarios.find((e) => e.id === escenarioId);
  if (!escenario) throw new Error(`Escenario inexistente: ${escenarioId}`);

  const inicio = performance.now();
  const base = redBase(datos);
  const mutada = redBase(datos);
  aplicarMutaciones(mutada, escenario.mutaciones);

  const severidad = severidadPorBarrio(base, mutada);
  const horas = duracionFalla(datos, duracionHoras);
  const metricas = calcularMetricas(mutada, severidad, datos.supuestos, horas);

  const nombreDeNodo = (id: string) => datos.nodos.find((n) => n.id === id)?.nombre ?? id;
  const explicacion = explicarResultado(escenario, severidad, metricas, nombreDeNodo, horas);

  return {
    escenarioId,
    escenarioNombre: escenario.nombre,
    severidadPorBarrio: severidad,
    metricas,
    explicacion,
    duracionMs: Number((performance.now() - inicio).toFixed(2)),
  };
}

export function simularEscenarioCustom(
  datos: DatosCascade,
  mutaciones: Mutacion[],
  nombreCustom = "Escenario Personalizado",
  duracionHoras?: number
): ResultadoSimulacion {
  const inicio = performance.now();
  const base = redBase(datos);
  const mutada = redBase(datos);
  aplicarMutaciones(mutada, mutaciones);

  const severidad = severidadPorBarrio(base, mutada);
  const horas = duracionFalla(datos, duracionHoras);
  const metricas = calcularMetricas(mutada, severidad, datos.supuestos, horas);

  const nombreDeNodo = (id: string) => datos.nodos.find((n) => n.id === id)?.nombre ?? id;
  const escenarioFake = {
    id: "custom",
    nombre: nombreCustom,
    descripcion: "Escenario personalizado interactivo generado por el usuario",
    mutaciones,
  };
  const explicacion = explicarResultado(escenarioFake, severidad, metricas, nombreDeNodo, horas);

  return {
    escenarioId: "custom",
    escenarioNombre: nombreCustom,
    severidadPorBarrio: severidad,
    metricas,
    explicacion,
    duracionMs: Number((performance.now() - inicio).toFixed(2)),
  };
}
