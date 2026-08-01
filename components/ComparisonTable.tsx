import type { JSX } from "react";
import type { ResultadoMetricas, ResultadoManiobra, Severidad } from "../lib/types";

export interface EscenarioResumen {
  id: string;
  nombre: string;
  descripcion?: string;
}

export interface ResultadoComparacion {
  escenarioId: string;
  escenarioNombre: string;
  severidadPorBarrio: Record<string, Severidad>;
  metricas: ResultadoMetricas;
}

export interface ComparisonTableProps {
  escenarios: EscenarioResumen[];
  resultadoComparacion: ResultadoComparacion[];
  ranking?: {
    criterio?: string;
    resultados: ResultadoManiobra[];
  };
}

export default function ComparisonTable({
  resultadoComparacion,
  ranking,
}: ComparisonTableProps): JSX.Element {
  const mejorManiobra = ranking?.resultados?.[0];

  return (
    <div
      style={{
        backgroundColor: "#101B2E",
        border: "1px solid #1E293B",
        borderRadius: "8px",
        padding: "16px",
        color: "#E2E8F0",
        fontFamily: "sans-serif",
      }}
    >
      <h3 style={{ margin: "0 0 12px 0", fontSize: "16px", color: "#F8FAFC" }}>Comparación de Escenarios</h3>

      {mejorManiobra ? (
        <div
          style={{
            backgroundColor: "#065F46",
            border: "1px solid #10B981",
            borderRadius: "6px",
            padding: "12px",
            marginBottom: "16px",
            color: "#ECFDF5",
          }}
        >
          <div style={{ fontSize: "12px", textTransform: "uppercase", fontWeight: "bold", letterSpacing: "0.5px" }}>
            ⭐ Mejor Maniobra de Mitigación
          </div>
          <div style={{ fontSize: "16px", fontWeight: "bold", marginTop: "4px" }}>
            {mejorManiobra.nombre}
          </div>
          <div style={{ fontSize: "13px", marginTop: "4px" }}>
            Costo estimado: <strong>$ {mejorManiobra.metricas.costoMitigacionARS.toLocaleString("es-AR")}</strong> |{" "}
            Déficit: {mejorManiobra.metricas.deficitM3} m³ | Camiones: {mejorManiobra.metricas.camionesRequeridos}
          </div>
        </div>
      ) : null}

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", textAlign: "left" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #334155", color: "#94A3B8" }}>
              <th style={{ padding: "8px" }}>Escenario</th>
              <th style={{ padding: "8px" }}>Sin Agua</th>
              <th style={{ padding: "8px" }}>Baja Presión</th>
              <th style={{ padding: "8px" }}>Déficit (m³)</th>
              <th style={{ padding: "8px" }}>Costo ($ ARS)</th>
              <th style={{ padding: "8px" }}>Camiones</th>
            </tr>
          </thead>
          <tbody>
            {resultadoComparacion.map((item) => {
              const sinAguaCount = Object.values(item.severidadPorBarrio).filter((s) => s === "sin_servicio").length;
              const bajaPresionCount = Object.values(item.severidadPorBarrio).filter((s) => s === "baja_presion").length;

              return (
                <tr key={item.escenarioId} style={{ borderBottom: "1px solid #1E293B" }}>
                  <td style={{ padding: "8px", fontWeight: "bold" }}>{item.escenarioNombre}</td>
                  <td style={{ padding: "8px", color: sinAguaCount > 0 ? "#F87171" : "#94A3B8" }}>
                    {sinAguaCount} barrios
                  </td>
                  <td style={{ padding: "8px", color: bajaPresionCount > 0 ? "#FBBF24" : "#94A3B8" }}>
                    {bajaPresionCount} barrios
                  </td>
                  <td style={{ padding: "8px" }}>{item.metricas.deficitM3.toLocaleString("es-AR")}</td>
                  <td style={{ padding: "8px" }}>$ {item.metricas.costoMitigacionARS.toLocaleString("es-AR")}</td>
                  <td style={{ padding: "8px" }}>{item.metricas.camionesRequeridos}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
