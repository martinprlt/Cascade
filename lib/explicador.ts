import { Escenario, ResultadoMetricas, Severidad } from "./types";

const NOMBRES_SEVERIDAD: Record<Severidad, string> = {
  sin_servicio: "sin servicio",
  baja_presion: "baja presión",
  normal: "normal",
};

export function explicarResultado(
  escenario: Escenario,
  severidad: Record<string, Severidad>,
  metricas: ResultadoMetricas,
  nombreDeNodo: (id: string) => string,
  duracionHoras: number
): string {
  const porSeveridad: Record<"sin_servicio" | "baja_presion", string[]> = {
    sin_servicio: [],
    baja_presion: [],
  };
  for (const [id, sev] of Object.entries(severidad)) {
    if (sev === "sin_servicio" || sev === "baja_presion") porSeveridad[sev].push(nombreDeNodo(id));
  }

  const partes: string[] = [];
  partes.push(`Escenario: ${escenario.nombre}.`);
  if (porSeveridad.sin_servicio.length > 0) {
    partes.push(
      `${porSeveridad.sin_servicio.length} barrio${porSeveridad.sin_servicio.length > 1 ? "s" : ""} ${NOMBRES_SEVERIDAD.sin_servicio}: ${porSeveridad.sin_servicio.join(", ")} (${metricas.usuariosSinServicio} usuarios).`
    );
  }
  if (porSeveridad.baja_presion.length > 0) {
    partes.push(
      `${porSeveridad.baja_presion.length} barrio${porSeveridad.baja_presion.length > 1 ? "s" : ""} con ${NOMBRES_SEVERIDAD.baja_presion}: ${porSeveridad.baja_presion.join(", ")} (${metricas.usuariosBajaPresion} usuarios).`
    );
  }
  if (porSeveridad.sin_servicio.length === 0 && porSeveridad.baja_presion.length === 0) {
    partes.push("Ningún barrio resulta afectado.");
  }
  partes.push(
    `Déficit estimado: ${metricas.deficitM3} m³ en ${duracionHoras} h. Mitigación: ${metricas.viajesCamion} viajes de camión aguatero (${metricas.camionesRequeridos} camiones), costo estimado $ ${metricas.costoMitigacionARS.toLocaleString("es-AR")}.`
  );
  return partes.join(" ");
}
