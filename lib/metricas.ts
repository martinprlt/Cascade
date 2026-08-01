import { RedDeAgua, ResultadoMetricas, Severidad, SupuestosMetricas } from "./types";

export function calcularMetricas(
  red: RedDeAgua,
  severidad: Record<string, Severidad>,
  supuestos: SupuestosMetricas,
  duracionHoras: number
): ResultadoMetricas {
  if (!Number.isFinite(duracionHoras) || duracionHoras <= 0) {
    throw new Error(`duracionHoras debe ser un numero positivo (recibido: ${duracionHoras})`);
  }
  let sinServicio = 0;
  let bajaPresion = 0;
  let total = 0;

  for (const n of red.nodos) {
    if (n.tipo !== "barrio" || n.usuarios === undefined) continue;
    total += n.usuarios;
    const sev = severidad[n.id];
    if (sev === "sin_servicio") sinServicio += n.usuarios;
    else if (sev === "baja_presion") bajaPresion += n.usuarios;
  }

  const duracionDias = duracionHoras / 24;
  const m3PerCapitaDia = supuestos.consumoLitrosPerCapitaDia / 1000;
  const deficitM3 =
    (sinServicio + bajaPresion * supuestos.factorSeveridadBajaPresion) * m3PerCapitaDia * duracionDias;

  const viajesCamion = Math.ceil(deficitM3 / supuestos.capacidadCisternaM3);
  const costoMitigacionARS = viajesCamion * supuestos.costoViajeCamionAguateroARS;
  const camionesRequeridos = Math.ceil(
    deficitM3 / duracionDias / (supuestos.capacidadCisternaM3 * supuestos.viajesPorCamionDia)
  );
  const severidadAgregada =
    total > 0 ? (sinServicio + bajaPresion * supuestos.factorSeveridadBajaPresion) / total : 0;

  return {
    usuariosSinServicio: sinServicio,
    usuariosBajaPresion: bajaPresion,
    deficitM3: Math.round(deficitM3),
    viajesCamion,
    costoMitigacionARS,
    camionesRequeridos,
    severidadAgregada: Number(severidadAgregada.toFixed(4)),
    usuariosTotales: total,
  };
}
