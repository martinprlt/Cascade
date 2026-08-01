import type { JSX } from "react";

export interface MetricCardProps {
  label: string;
  valor: number | string;
  sufijo?: string;
  tono?: "rojo" | "verde" | "neutro";
  sub?: string;
}

export default function MetricCard({
  label,
  valor,
  sufijo,
  tono = "neutro",
  sub,
}: MetricCardProps): JSX.Element {
  let color = "#E2E8F0";
  if (tono === "rojo") color = "#F87171";
  if (tono === "verde") color = "#34D399";

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
      <div style={{ fontSize: "12px", color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.5px" }}>
        {label}
      </div>
      <div style={{ fontSize: "36px", fontWeight: "bold", color, margin: "8px 0 4px 0" }}>
        {typeof valor === "number" ? valor.toLocaleString("es-AR") : valor}
        {sufijo ? <span style={{ fontSize: "18px", marginLeft: "4px", fontWeight: "normal" }}>{sufijo}</span> : null}
      </div>
      {sub ? <div style={{ fontSize: "12px", color: "#64748B" }}>{sub}</div> : null}
    </div>
  );
}
