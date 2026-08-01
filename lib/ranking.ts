import { DatosCascade, ResultadoManiobra } from "./types";
import { aplicarMutaciones, redBase } from "./grafo";
import { severidadPorBarrio } from "./motor";
import { calcularMetricas } from "./metricas";
import { duracionFalla } from "./escenarios";

export function rankingAlternativas(
  datos: DatosCascade,
  escenarioId: string,
  duracionHoras?: number
): ResultadoManiobra[] {
  const escenario = datos.escenarios.find((e) => e.id === escenarioId);
  if (!escenario) throw new Error(`Escenario inexistente: ${escenarioId}`);
  if (!escenario.ranking) throw new Error(`El escenario ${escenarioId} no define ranking de alternativas`);

  const horas = duracionFalla(datos, duracionHoras);
  const base = redBase(datos);

  const resultados = escenario.ranking.candidatos.map((c) => {
    const mutada = redBase(datos);
    aplicarMutaciones(mutada, [...escenario.mutaciones, ...c.mutaciones]);
    const severidad = severidadPorBarrio(base, mutada);
    const metricas = calcularMetricas(mutada, severidad, datos.supuestos, horas);
    return {
      maniobraId: c.id,
      nombre: c.nombre,
      severidadPorBarrio: severidad,
      metricas,
    };
  });

  resultados.sort((a, b) => {
    const porCosto = a.metricas.costoMitigacionARS - b.metricas.costoMitigacionARS;
    if (porCosto !== 0) return porCosto;
    const porDeficit = a.metricas.deficitM3 - b.metricas.deficitM3;
    if (porDeficit !== 0) return porDeficit;
    return a.metricas.severidadAgregada - b.metricas.severidadAgregada;
  });

  return resultados;
}
