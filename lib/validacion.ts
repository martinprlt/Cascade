import { DatosCascade, ResultadoValidacion } from "./types";
import { simularEscenario } from "./escenarios";

export function validarContraEventoReal(datos: DatosCascade, escenarioId: string): ResultadoValidacion {
  const escenario = datos.escenarios.find((e) => e.id === escenarioId);
  if (!escenario?.validacion?.estadoEsperado) {
    throw new Error(`El escenario ${escenarioId} no tiene validacion definida`);
  }

  const resultado = simularEscenario(datos, escenarioId);
  const esperado = escenario.validacion.estadoEsperado;

  const prediccion: { sin_servicio: string[]; baja_presion: string[] } = {
    sin_servicio: [],
    baja_presion: [],
  };
  for (const [id, sev] of Object.entries(resultado.severidadPorBarrio)) {
    if (sev === "sin_servicio" || sev === "baja_presion") prediccion[sev].push(id);
  }

  const recall = (pred: string[], rep: string[]): number =>
    rep.length === 0 ? (pred.length === 0 ? 1 : 0) : pred.filter((id) => rep.includes(id)).length / rep.length;

  const recallSinServicio = recall(prediccion.sin_servicio, esperado.sin_servicio ?? []);
  const recallBajaPresion = recall(prediccion.baja_presion, esperado.baja_presion ?? []);

  return {
    escenarioId,
    prediccion,
    esperado,
    recallSinServicio,
    recallBajaPresion,
    recallPromedio: (recallSinServicio + recallBajaPresion) / 2,
    metricas: resultado.metricas,
  };
}
