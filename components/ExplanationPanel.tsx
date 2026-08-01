import type { JSX } from "react";

export type FuenteExplicacion = "deterministico" | "ia";

export interface ExplanationPanelProps {
  texto: string;
  fuente: FuenteExplicacion;
  cargando?: boolean;
}

export default function ExplanationPanel({
  texto,
  fuente,
  cargando = false,
}: ExplanationPanelProps): JSX.Element {
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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
        <h3 style={{ margin: 0, fontSize: "16px", color: "#F8FAFC" }}>Explicación del Impacto</h3>
        <span
          style={{
            fontSize: "11px",
            padding: "2px 8px",
            borderRadius: "12px",
            backgroundColor: fuente === "ia" ? "#0284C7" : "#475569",
            color: "#FFFFFF",
            fontWeight: "bold",
          }}
        >
          {fuente === "ia" ? "IA Generativa" : "Motor Determinista"}
        </span>
      </div>

      {cargando ? (
        <div style={{ color: "#94A3B8", fontSize: "13px", fontStyle: "italic" }}>
          Generando explicación del impacto...
        </div>
      ) : (
        <p style={{ margin: 0, fontSize: "14px", lineHeight: "1.5", color: "#CBD5E1" }}>{texto}</p>
      )}
    </div>
  );
}
