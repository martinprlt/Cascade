import type { JSX } from "react";

export interface EscenarioResumen {
  id: string;
  nombre: string;
  descripcion?: string;
}

export interface ScenarioPanelProps {
  escenarios: EscenarioResumen[];
  seleccionadoId: string | null;
  onSelect: (escenarioId: string) => void;
  deshabilitado?: boolean;
}

export default function ScenarioPanel({
  escenarios,
  seleccionadoId,
  onSelect,
  deshabilitado = false,
}: ScenarioPanelProps): JSX.Element {
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
      <h3 style={{ margin: "0 0 12px 0", fontSize: "16px", color: "#F8FAFC" }}>Escenarios de Falla</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {escenarios.map((esc) => {
          const isSelected = seleccionadoId === esc.id;
          return (
            <button
              key={esc.id}
              onClick={() => onSelect(esc.id)}
              disabled={deshabilitado}
              style={{
                textAlign: "left",
                padding: "10px 14px",
                borderRadius: "6px",
                border: isSelected ? "1px solid #38BDF8" : "1px solid #334155",
                backgroundColor: isSelected ? "#1E293B" : "#0F172A",
                color: isSelected ? "#38BDF8" : "#94A3B8",
                cursor: deshabilitado ? "not-allowed" : "pointer",
                fontWeight: isSelected ? "bold" : "normal",
                transition: "all 0.15s ease",
              }}
            >
              <div>{esc.nombre}</div>
              {esc.descripcion ? (
                <div style={{ fontSize: "11px", color: "#64748B", marginTop: "2px" }}>{esc.descripcion}</div>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
