import { useState, type JSX } from "react";

export type FuenteExplicacion = "deterministico" | "ia";

export interface ExplanationPanelProps {
  texto: string;
  fuente: FuenteExplicacion;
  cargando?: boolean;
  modelo?: string;
}

export default function ExplanationPanel({
  texto,
  fuente,
  cargando = false,
  modelo = "llama-3.3-70b-versatile",
}: ExplanationPanelProps): JSX.Element {
  const [copiado, setCopiado] = useState(false);

  const handleCopiar = () => {
    if (!texto) return;
    navigator.clipboard.writeText(texto);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  const isIA = fuente === "ia";

  return (
    <div
      style={{
        backgroundColor: "#101B2E",
        border: `1px solid ${isIA ? "rgba(99, 102, 241, 0.4)" : "#1E293B"}`,
        borderRadius: "6px",
        display: "flex",
        flexDirection: "column",
        boxShadow: isIA ? "0 4px 20px rgba(99, 102, 241, 0.08)" : "none",
        transition: "all 0.2s ease-in-out",
      }}
    >
      <div
        style={{
          padding: "10px 16px",
          borderBottom: "1px solid #1E293B",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: "#162032",
          borderTopLeftRadius: "6px",
          borderTopRightRadius: "6px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              backgroundColor: cargando ? "#F59E0B" : isIA ? "#6366F1" : "#51df8e",
              boxShadow: cargando
                ? "0 0 8px #F59E0B"
                : isIA
                ? "0 0 8px #6366F1"
                : "0 0 8px #51df8e",
            }}
          />
          <h2
            style={{
              margin: 0,
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.08em",
              color: "#E2E8F0",
              textTransform: "uppercase",
            }}
          >
            Explicación Técnica
          </h2>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span
            style={{
              backgroundColor: isIA ? "rgba(99, 102, 241, 0.2)" : "rgba(81, 223, 142, 0.15)",
              color: isIA ? "#A5B4FC" : "#51df8e",
              fontSize: "10px",
              fontWeight: "bold",
              padding: "3px 10px",
              borderRadius: "4px",
              border: `1px solid ${isIA ? "rgba(99, 102, 241, 0.4)" : "rgba(81, 223, 142, 0.3)"}`,
              letterSpacing: "0.05em",
            }}
          >
            {cargando
              ? "COMPUTANDO..."
              : isIA
              ? `GROQ IA (${modelo.toUpperCase()})`
              : "DETERMINÍSTICO"}
          </span>

          {!cargando && texto && (
            <button
              onClick={handleCopiar}
              title="Copiar al portapapeles"
              style={{
                backgroundColor: "transparent",
                border: "1px solid #334155",
                borderRadius: "4px",
                color: copiado ? "#51df8e" : "#94A3B8",
                fontSize: "11px",
                padding: "2px 8px",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              {copiado ? "✓ Copiado" : "Copiar"}
            </button>
          )}
        </div>
      </div>

      <div style={{ padding: "16px 20px", flex: 1 }}>
        {cargando ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              color: "#94A3B8",
              fontSize: "13px",
              fontStyle: "italic",
            }}
          >
            <span
              style={{
                display: "inline-block",
                width: "12px",
                height: "12px",
                border: "2px solid rgba(99, 102, 241, 0.3)",
                borderTopColor: "#6366F1",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
              }}
            />
            Generando explicación ejecutiva con Groq (Llama-3.3-70b)...
          </div>
        ) : (
          <p
            style={{
              margin: 0,
              fontSize: "14px",
              lineHeight: "1.6",
              color: "#DDE3EB",
              fontFamily: "system-ui, -apple-system, sans-serif",
            }}
          >
            {texto}
          </p>
        )}
      </div>
    </div>
  );
}
