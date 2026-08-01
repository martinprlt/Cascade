"use client";

import type { Arista, Nodo, Severidad } from "../lib/types";

export interface NetworkViewProps {
  nodos: Nodo[];
  aristas: Arista[];
  severidad?: Record<string, Severidad>;
  etiquetas?: boolean;
}

const ANCHO = 1000;
const ALTO = 680;

const COLORES_SEVERIDAD: Record<Severidad, string> = {
  sin_servicio: "var(--color-sin-servicio, #D92D20)",
  baja_presion: "var(--color-baja-presion, #F79009)",
  normal: "var(--color-normal, #12B76A)",
};

const COLOR_NODO_BASE: Partial<Record<Nodo["tipo"], string>> = {
  acueducto: "#818CF8",
  perforacion: "#38BDF8",
  tanque: "#2DD4BF",
  bomba: "#34D399",
  valvula: "#FBBF24",
  barrio: "#94A3B8",
};

const POSICIONES: Record<string, { x: number; y: number }> = {
  "acu-sanagasta": { x: 100, y: 70 },
  "valvula-sanagasta": { x: 200, y: 70 },
  "tanque-oeste": { x: 200, y: 160 },
  "dist-oeste": { x: 200, y: 290 },
  "perf-plaza-pesebre": { x: 40, y: 180 },
  "perf-cochangasta": { x: 40, y: 230 },
  "perf-unlar": { x: 40, y: 280 },
  "perf-colegio-medico": { x: 40, y: 330 },
  "perf-b-municipal": { x: 40, y: 380 },
  "perf-circunvalacion": { x: 40, y: 430 },
  "perf-parque-ciudad": { x: 40, y: 480 },
  "valvula-rama-alta": { x: 330, y: 120 },
  "barrio-san-nicolas": { x: 420, y: 90 },
  "barrio-don-bosco": { x: 420, y: 160 },
  "barrio-centro": { x: 330, y: 250 },
  "tanque-central": { x: 450, y: 350 },
  "valvula-este": { x: 600, y: 320 },
  "acu-zona-este": { x: 740, y: 320 },
  "dist-este": { x: 880, y: 320 },
  "barrio-yacampis": { x: 930, y: 230 },
  "barrio-la-rodadera": { x: 930, y: 320 },
  "barrio-centro-comercial": { x: 930, y: 410 },
  "dist-sur": { x: 540, y: 470 },
  "bomba-sur": { x: 660, y: 470 },
  "valvula-cactus": { x: 540, y: 540 },
  "perf-copegraf": { x: 60, y: 600 },
  "perf-lawn-tenis": { x: 160, y: 600 },
  "perf-las-talas": { x: 260, y: 600 },
  "perf-parque-familia": { x: 360, y: 600 },
  "perf-los-cactus": { x: 460, y: 600 },
  "barrio-procrear": { x: 460, y: 650 },
  "barrio-nk-alta": { x: 540, y: 650 },
  "barrio-las-talas-alta": { x: 620, y: 650 },
  "barrio-luis-vernet": { x: 740, y: 540 },
  "barrio-el-mirador": { x: 820, y: 540 },
  "barrio-coop-santa-rosa": { x: 900, y: 540 },
  "barrio-susana-quintela": { x: 740, y: 600 },
  "barrio-rivadavia": { x: 820, y: 600 },
  "barrio-emp-telecom": { x: 900, y: 600 },
  "barrio-circunvalacion": { x: 740, y: 650 },
  "barrio-nueva-esperanza": { x: 820, y: 650 },
  "barrio-san-cayetano": { x: 900, y: 650 },
  "valvula-inter-sur-oeste": { x: 370, y: 390 },
  "valvula-inter-sur-este": { x: 495, y: 410 },
};

const ZONAS: Array<{ zona: string; x: number; y: number; w: number; h: number }> = [
  { zona: "OESTE", x: 20, y: 40, w: 440, h: 460 },
  { zona: "CENTRO", x: 300, y: 220, w: 170, h: 160 },
  { zona: "ESTE", x: 580, y: 200, w: 390, h: 240 },
  { zona: "SUR", x: 30, y: 440, w: 940, h: 240 },
];

function posicionNodo(nodo: Nodo): { x: number; y: number } {
  const fija = POSICIONES[nodo.id];
  if (fija) return fija;
  const porZona: Record<string, { x: number; y: number }> = {
    oeste: { x: 200, y: 300 },
    sur: { x: 500, y: 560 },
    este: { x: 800, y: 320 },
    centro: { x: 400, y: 300 },
  };
  return porZona[nodo.zona] ?? { x: 500, y: 340 };
}

function etiquetaCorta(nombre: string): string {
  return nombre.replace(/^Barrio\s+/i, "").replace(/\s*\(.*?\)\s*$/g, "");
}

export default function NetworkView({ nodos, aristas, severidad, etiquetas = true }: NetworkViewProps) {
  return (
    <svg
      viewBox={`0 0 ${ANCHO} ${ALTO}`}
      style={{ width: "100%", height: "auto", display: "block" }}
      role="img"
      aria-label="Red de agua de Capital, La Rioja"
    >
      <defs>
        <marker id="flecha" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#94A3B8" />
        </marker>
      </defs>

      <rect width={ANCHO} height={ALTO} fill="#0E1526" />

      {ZONAS.map((z) => (
        <g key={z.zona}>
          <rect x={z.x} y={z.y} width={z.w} height={z.h} fill="#FFFFFF" opacity={0.03} rx={8} />
          <text x={z.x + 10} y={z.y + 18} fontSize={10} fill="#475569" letterSpacing={2}>
            {z.zona}
          </text>
        </g>
      ))}

      {aristas.map((a, i) => {
        const fDesde = POSICIONES[a.from];
        const fHasta = POSICIONES[a.to];
        if (!fDesde || !fHasta) return null;
        const cerrada = a.estado === "cerrada";
        return (
          <line
            key={i}
            x1={fDesde.x}
            y1={fDesde.y}
            x2={fHasta.x}
            y2={fHasta.y}
            stroke={cerrada ? "#475569" : "#94A3B8"}
            strokeWidth={cerrada ? 1 : 1.5}
            strokeDasharray={cerrada ? "4 4" : undefined}
            opacity={cerrada ? 0.45 : 0.7}
            markerEnd={cerrada ? undefined : "url(#flecha)"}
          />
        );
      })}

      {nodos
        .filter((n) => n.subTipo === "interconexion")
        .map((n) => {
          const p = POSICIONES[n.id];
          if (!p) return null;
          return (
            <g key={n.id}>
              <polygon
                points={`${p.x},${p.y - 7} ${p.x + 7},${p.y} ${p.x},${p.y + 7} ${p.x - 7},${p.y}`}
                fill="none"
                stroke="#64748B"
                strokeWidth={1.5}
                strokeDasharray="3 3"
              />
              <title>{n.nombre}</title>
            </g>
          );
        })}

      {nodos
        .filter((n) => n.subTipo !== "interconexion")
        .map((n) => {
          const p = posicionNodo(n);
          const sev = severidad?.[n.id];
          const fill =
            n.estado === "fallado" ? "#B91C1C" : sev ? COLORES_SEVERIDAD[sev] : COLOR_NODO_BASE[n.tipo] ?? "#94A3B8";
          const contorno = "#E2E8F0";
          const forma = (() => {
            switch (n.tipo) {
              case "tanque":
                return (
                  <rect x={p.x - 8} y={p.y - 8} width={16} height={16} rx={2} fill={fill} stroke={contorno} strokeWidth={1.2} />
                );
              case "bomba":
                return (
                  <rect x={p.x - 7} y={p.y - 7} width={14} height={14} rx={1} fill={fill} stroke={contorno} strokeWidth={1.2} />
                );
              case "valvula":
                return (
                  <polygon
                    points={`${p.x},${p.y - 8} ${p.x + 8},${p.y} ${p.x},${p.y + 8} ${p.x - 8},${p.y}`}
                    fill={fill}
                    stroke={contorno}
                    strokeWidth={1.2}
                  />
                );
              default: {
                const r = n.tipo === "barrio" ? 11 : n.tipo === "perforacion" ? 7 : 9;
                return <circle cx={p.x} cy={p.y} r={r} fill={fill} stroke={contorno} strokeWidth={1.2} />;
              }
            }
          })();
          return (
            <g key={n.id}>
              {forma}
              <title>{n.nombre}</title>
              {etiquetas && n.tipo === "barrio" && (
                <text
                  x={p.x}
                  y={p.y + 24}
                  textAnchor="middle"
                  fontSize={11}
                  fill="#CBD5E1"
                  style={{ userSelect: "none", pointerEvents: "none" }}
                >
                  {etiquetaCorta(n.nombre)}
                </text>
              )}
            </g>
          );
        })}
    </svg>
  );
}
