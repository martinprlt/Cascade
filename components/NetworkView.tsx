"use client";

import { useState, useRef, useCallback, type MouseEvent, type WheelEvent } from "react";
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
  sin_servicio: "#D92D20",
  baja_presion: "#F79009",
  normal: "#12B76A",
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
  "acu-sanagasta": { x: 110, y: 80 },
  "valvula-sanagasta": { x: 210, y: 80 },
  "tanque-oeste": { x: 210, y: 170 },
  "dist-oeste": { x: 210, y: 290 },
  "perf-plaza-pesebre": { x: 50, y: 180 },
  "perf-cochangasta": { x: 50, y: 230 },
  "perf-unlar": { x: 50, y: 280 },
  "perf-colegio-medico": { x: 50, y: 330 },
  "perf-b-municipal": { x: 50, y: 380 },
  "perf-circunvalacion": { x: 50, y: 430 },
  "perf-parque-ciudad": { x: 50, y: 480 },
  "valvula-rama-alta": { x: 330, y: 120 },
  "barrio-san-nicolas": { x: 430, y: 90 },
  "barrio-don-bosco": { x: 430, y: 160 },
  "barrio-centro": { x: 330, y: 250 },
  "tanque-central": { x: 450, y: 350 },
  "valvula-este": { x: 600, y: 320 },
  "acu-zona-este": { x: 740, y: 320 },
  "dist-este": { x: 870, y: 320 },
  "barrio-yacampis": { x: 930, y: 230 },
  "barrio-la-rodadera": { x: 930, y: 320 },
  "barrio-centro-comercial": { x: 930, y: 410 },
  "dist-sur": { x: 540, y: 470 },
  "bomba-sur": { x: 660, y: 470 },
  "valvula-cactus": { x: 540, y: 540 },
  "perf-copegraf": { x: 70, y: 590 },
  "perf-lawn-tenis": { x: 170, y: 590 },
  "perf-las-talas": { x: 270, y: 590 },
  "perf-parque-familia": { x: 370, y: 590 },
  "perf-los-cactus": { x: 470, y: 590 },
  "barrio-procrear": { x: 470, y: 645 },
  "barrio-nk-alta": { x: 550, y: 645 },
  "barrio-las-talas-alta": { x: 630, y: 645 },
  "barrio-luis-vernet": { x: 740, y: 530 },
  "barrio-el-mirador": { x: 820, y: 530 },
  "barrio-coop-santa-rosa": { x: 900, y: 530 },
  "barrio-susana-quintela": { x: 740, y: 590 },
  "barrio-rivadavia": { x: 820, y: 590 },
  "barrio-emp-telecom": { x: 900, y: 590 },
  "barrio-circunvalacion": { x: 740, y: 645 },
  "barrio-nueva-esperanza": { x: 820, y: 645 },
  "barrio-san-cayetano": { x: 900, y: 645 },
  "valvula-inter-sur-oeste": { x: 370, y: 390 },
  "valvula-inter-sur-este": { x: 495, y: 410 },
};

const ZONAS: Array<{ zona: string; x: number; y: number; w: number; h: number }> = [
  { zona: "OESTE (Ramal Sanagasta)", x: 20, y: 40, w: 440, h: 460 },
  { zona: "CENTRO", x: 300, y: 220, w: 170, h: 160 },
  { zona: "ESTE (Acueducto 2022)", x: 580, y: 200, w: 390, h: 240 },
  { zona: "SUR (Perforaciones & Los Cactus)", x: 30, y: 440, w: 940, h: 235 },
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
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState<number>(1.0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [is3D, setIs3D] = useState<boolean>(false);
  const [nodoSeleccionado, setNodoSeleccionado] = useState<Nodo | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  }, [pan]);

  const handleMouseMove = useCallback((e: MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleWheel = useCallback((e: WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.08 : 0.92;
    setZoom((prevZoom) => Math.min(Math.max(prevZoom * factor, 0.6), 3.0));
  }, []);

  const resetView = useCallback(() => {
    setPan({ x: 0, y: 0 });
    setZoom(1.0);
  }, []);

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        flex: 1,
        backgroundColor: "#0B1220",
        overflow: "hidden",
        cursor: isDragging ? "grabbing" : "grab",
        userSelect: "none",
      }}
    >
      {/* GIS HUD Control Panel Bar */}
      <div
        style={{
          position: "absolute",
          top: 12,
          left: 12,
          zIndex: 30,
          display: "flex",
          flexDirection: "column",
          gap: 6,
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            background: "rgba(14,20,26,0.92)",
            border: "1px solid #3d4a3f",
            padding: "4px 10px",
            fontSize: 10,
            fontFamily: "monospace",
            color: "#51df8e",
            borderRadius: 2,
            display: "flex",
            alignItems: "center",
            gap: 8,
            boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
          }}
        >
          <span style={{ width: 7, height: 7, backgroundColor: "#51df8e", borderRadius: "50%", display: "inline-block" }}></span>
          SYSTEM: LA_RIOJA_GIS_OVERLAY
        </div>
        <div style={{ background: "rgba(14,20,26,0.92)", border: "1px solid #3d4a3f", padding: "4px 10px", fontSize: 10, fontFamily: "monospace", color: "#bccabc", borderRadius: 2 }}>
          LAT: -29.412 | LON: -66.855 | ZOOM: {(zoom * 100).toFixed(0)}%
        </div>
      </div>

      {/* Viewport Control Buttons */}
      <div
        style={{
          position: "absolute",
          top: 12,
          right: 12,
          zIndex: 30,
          display: "flex",
          gap: 6,
        }}
      >
        <button
          onClick={() => setIs3D(!is3D)}
          style={{
            backgroundColor: is3D ? "#51df8e" : "#1a2026",
            color: is3D ? "#00391d" : "#51df8e",
            border: "1px solid #51df8e",
            padding: "4px 10px",
            fontSize: 11,
            fontWeight: "bold",
            borderRadius: 2,
            cursor: "pointer",
          }}
        >
          {is3D ? "MODO 3D (ON)" : "VISTA 3D"}
        </button>

        <button
          onClick={() => setZoom((z) => Math.min(z * 1.2, 3.0))}
          style={{ backgroundColor: "#1a2026", color: "#E2E8F0", border: "1px solid #334155", width: 28, height: 28, fontSize: 16, fontWeight: "bold", cursor: "pointer", borderRadius: 2 }}
        >
          +
        </button>
        <button
          onClick={() => setZoom((z) => Math.max(z * 0.8, 0.6))}
          style={{ backgroundColor: "#1a2026", color: "#E2E8F0", border: "1px solid #334155", width: 28, height: 28, fontSize: 16, fontWeight: "bold", cursor: "pointer", borderRadius: 2 }}
        >
          -
        </button>
        <button
          onClick={resetView}
          style={{ backgroundColor: "#1a2026", color: "#bccabc", border: "1px solid #334155", padding: "4px 8px", fontSize: 11, cursor: "pointer", borderRadius: 2 }}
        >
          Recentrar
        </button>
      </div>

      {/* Selected Node Details Tooltip Card */}
      {nodoSeleccionado && (
        <div
          style={{
            position: "absolute",
            bottom: 12,
            left: 12,
            zIndex: 40,
            backgroundColor: "rgba(16, 27, 46, 0.95)",
            border: "1px solid #51df8e",
            padding: 12,
            borderRadius: 4,
            width: 280,
            color: "#E2E8F0",
            fontSize: 12,
            boxShadow: "0 8px 24px rgba(0,0,0,0.6)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontWeight: "bold", fontSize: 13, color: "#51df8e" }}>{nodoSeleccionado.nombre}</span>
            <button onClick={() => setNodoSeleccionado(null)} style={{ background: "none", border: "none", color: "#94A3B8", cursor: "pointer", fontSize: 14 }}>✕</button>
          </div>
          <div>Tipo: <strong>{nodoSeleccionado.tipo.toUpperCase()}</strong> | Zona: <strong>{nodoSeleccionado.zona.toUpperCase()}</strong></div>
          {nodoSeleccionado.usuarios ? <div>Usuarios: <strong>{nodoSeleccionado.usuarios.toLocaleString("es-AR")}</strong> hab.</div> : null}
          {nodoSeleccionado.m3Dia ? <div>Demanda: <strong>{nodoSeleccionado.m3Dia} m³/día</strong></div> : null}
          {nodoSeleccionado.descripcion ? <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 4 }}>{nodoSeleccionado.descripcion}</div> : null}
        </div>
      )}

      {/* Main Vector Map SVG Plane */}
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom}) ${is3D ? "rotateX(48deg) rotateZ(-12deg)" : ""}`,
            transformOrigin: "center center",
            transition: isDragging ? "none" : "transform 0.15s ease-out",
            width: ANCHO,
            height: ALTO,
          }}
        >
          <svg viewBox={`0 0 ${ANCHO} ${ALTO}`} style={{ width: ANCHO, height: ALTO, display: "block" }}>
            <defs>
              <marker id="flecha" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#12B76A" />
              </marker>
            </defs>

            {/* Base Background */}
            <rect width={ANCHO} height={ALTO} fill="#0B1220" />

            {/* Urban Street Network Lines */}
            <g stroke="#1E293B" strokeWidth="1" opacity="0.6">
              <line x1={0} y1={150} x2={ANCHO} y2={150} stroke="#334155" strokeWidth={12} />
              <line x1={0} y1={300} x2={ANCHO} y2={300} stroke="#334155" strokeWidth={10} />
              <line x1={0} y1={470} x2={ANCHO} y2={470} stroke="#334155" strokeWidth={14} />
              <line x1={200} y1={0} x2={200} y2={ALTO} stroke="#334155" strokeWidth={10} />
              <line x1={600} y1={0} x2={600} y2={ALTO} stroke="#334155" strokeWidth={12} />
            </g>

            {/* Residential Blocks */}
            <g fill="#161C22" stroke="#1E293B" strokeWidth="1">
              <rect x={70} y={160} width={40} height={30} rx={2} />
              <rect x={120} y={160} width={40} height={30} rx={2} />
              <rect x={70} y={200} width={40} height={30} rx={2} />
              <rect x={120} y={200} width={40} height={30} rx={2} />
              <rect x={620} y={160} width={50} height={40} rx={2} />
              <rect x={680} y={160} width={50} height={40} rx={2} />
              <rect x={640} y={490} width={45} height={35} rx={2} />
              <rect x={695} y={490} width={45} height={35} rx={2} />
            </g>

            {/* 3D Shadows */}
            {is3D && (
              <g fill="#1E293B" opacity="0.8">
                <polygon points="70,190 110,190 110,198 70,198" />
                <polygon points="120,190 160,190 160,198 120,198" />
                <polygon points="620,200 670,200 670,210 620,210" />
              </g>
            )}

            {/* Street Labels */}
            <g fill="#64748B" fontFamily="Inter" fontSize="10" fontWeight="bold" letterSpacing="0.1em">
              <text x={30} y={142}>AV. SANAGASTA / RAMÍREZ DE VELASCO</text>
              <text x={30} y={292}>CALLE BAZÁN Y BUSTOS</text>
              <text x={30} y={462}>AV. LOS CACTUS / AV. CIRCUNVALACIÓN</text>
              <text transform="rotate(90, 190, 40)" x={190} y={40}>AV. FACUNDO QUIROGA</text>
              <text transform="rotate(90, 590, 40)" x={590} y={40}>AV. ORTIZ DE OCAMPO</text>
            </g>

            {/* Zones */}
            {ZONAS.map((z) => (
              <g key={z.zona}>
                <rect x={z.x} y={z.y} width={z.w} height={z.h} fill="#161C22" opacity={0.35} rx={4} stroke="#1E293B" strokeWidth={1} />
                <text x={z.x + 10} y={z.y + 18} fontSize={10} fontWeight="bold" fill="#51df8e" letterSpacing={2}>
                  SECTOR {z.zona}
                </text>
              </g>
            ))}

            {/* Pipelines */}
            {aristas.map((a, i) => {
              const fDesde = POSICIONES[a.from];
              const fHasta = POSICIONES[a.to];
              if (!fDesde || !fHasta) return null;
              const cerrada = a.estado === "cerrada";
              const colorArista = cerrada ? "#475569" : "#12B76A";
              return (
                <line
                  key={i}
                  x1={fDesde.x}
                  y1={fDesde.y}
                  x2={fHasta.x}
                  y2={fHasta.y}
                  stroke={colorArista}
                  strokeWidth={cerrada ? 1.5 : 2.5}
                  strokeDasharray={cerrada ? "4 4" : undefined}
                  opacity={cerrada ? 0.4 : 0.85}
                  markerEnd={cerrada ? undefined : "url(#flecha)"}
                />
              );
            })}

            {/* Nodes */}
            {nodos.map((n) => {
              const p = posicionNodo(n);
              const sev = severidad?.[n.id];
              const fill =
                n.estado === "fallado" ? "#D92D20" : sev ? COLORES_SEVERIDAD[sev] : COLOR_NODO_BASE[n.tipo] ?? "#94A3B8";
              const contorno = "#E2E8F0";

              return (
                <g
                  key={n.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setNodoSeleccionado(n);
                  }}
                  style={{ cursor: "pointer" }}
                >
                  {is3D && <ellipse cx={p.x} cy={p.y + 12} rx={12} ry={6} fill="#000000" opacity={0.6} />}

                  {sev === "sin_servicio" && (
                    <circle cx={p.x} cy={p.y} r={20} fill="none" stroke="#D92D20" strokeWidth={1.5} opacity={0.7}>
                      <animate attributeName="r" values="12;24;12" dur="2s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.8;0.2;0.8" dur="2s" repeatCount="indefinite" />
                    </circle>
                  )}
                  {sev === "baja_presion" && (
                    <circle cx={p.x} cy={p.y} r={16} fill="none" stroke="#F79009" strokeWidth={1} opacity={0.5}>
                      <animate attributeName="r" values="11;18;11" dur="3s" repeatCount="indefinite" />
                    </circle>
                  )}

                  <circle cx={p.x} cy={p.y} r={n.tipo === "barrio" ? 11 : 8} fill={fill} stroke={contorno} strokeWidth={1.5} />

                  <title>{n.nombre}</title>
                  {etiquetas && n.tipo === "barrio" && (
                    <text
                      x={p.x}
                      y={p.y + 24}
                      textAnchor="middle"
                      fontSize={10}
                      fontWeight="bold"
                      fill="#E2E8F0"
                      style={{ userSelect: "none", pointerEvents: "none" }}
                    >
                      {etiquetaCorta(n.nombre)}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    </div>
  );
}
