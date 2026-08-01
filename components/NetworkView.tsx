"use client";

import { useState, useRef, useCallback, type JSX, type MouseEvent, type WheelEvent } from "react";
import type { Arista, Mutacion, Nodo, Severidad, TipoNodo } from "../lib/types";

export interface NetworkViewProps {
  nodos: Nodo[];
  aristas: Arista[];
  severidad?: Record<string, Severidad>;
  etiquetas?: boolean;
  onSimularCustom?: (mutaciones: Mutacion[], nombreCustom: string) => void;
}

const ANCHO = 1000;
const ALTO = 680;

const COLORES_SEVERIDAD: Record<Severidad, string> = {
  sin_servicio: "#D92D20",
  baja_presion: "#F79009",
  normal: "#12B76A",
};

const COLOR_NODO_BASE: Record<TipoNodo, string> = {
  acueducto: "#818CF8",
  perforacion: "#38BDF8",
  tanque: "#2DD4BF",
  bomba: "#34D399",
  valvula: "#FBBF24",
  barrio: "#94A3B8",
};

const INFO_TIPO_NODO: Record<
  TipoNodo,
  { titulo: string; descripcion: string; iconoMaterial: string; accionFalla: string }
> = {
  barrio: {
    titulo: "Hogares / Barrio Residencial",
    descripcion: "Punto de demanda final de agua potable para familias y comercios.",
    iconoMaterial: "home",
    accionFalla: "Interrupción Local de Red Doméstica",
  },
  perforacion: {
    titulo: "Pozo / Perforación Subterránea",
    descripcion: "Fuente de extracción de napas subterráneas. Al fallar reduce la producción m³/h.",
    iconoMaterial: "water_drop",
    accionFalla: "Falla / Parada de Bomba de Pozo",
  },
  acueducto: {
    titulo: "Acueducto Troncal",
    descripcion: "Canal o tubería de alta capacidad que transporta agua en bloque.",
    iconoMaterial: "pipeline",
    accionFalla: "Rotura / Colapso de Acueducto Troncal",
  },
  tanque: {
    titulo: "Tanque de Reserva",
    descripcion: "Cisterna de almacenamiento y regulación de presión por gravedad.",
    iconoMaterial: "water_full",
    accionFalla: "Vaciado / Falla de Tanque de Reserva",
  },
  bomba: {
    titulo: "Estación de Rebombeo",
    descripcion: "Impulsión eléctrica para elevar presión a zonas altas.",
    iconoMaterial: "bolt",
    accionFalla: "Falla Eléctrica en Rebombeo",
  },
  valvula: {
    titulo: "Válvula de Control / Sectorización",
    descripcion: "Mecanismo para abrir, cerrar o derivar caudales en la red.",
    iconoMaterial: "tune",
    accionFalla: "Cierre / Bloqueo de Válvula",
  },
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

export default function NetworkView({
  nodos,
  aristas,
  severidad,
  etiquetas = true,
  onSimularCustom,
}: NetworkViewProps) {
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState<number>(1.0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [is3D, setIs3D] = useState<boolean>(false);
  const [nodoSeleccionado, setNodoSeleccionado] = useState<Nodo | null>(null);
  const [accionSimulada, setAccionSimulada] = useState<"falla" | "cierre" | "apertura">("falla");

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

  const ejecutarSimulacionNodo = (nodo: Nodo, accion: "falla" | "cierre" | "apertura") => {
    if (!onSimularCustom) return;
    const mutacion: Mutacion = {
      nodo: nodo.id,
      accion,
    };
    const info = INFO_TIPO_NODO[nodo.tipo];
    const nombre = `${info?.accionFalla ?? "Falla en"} ${nodo.nombre}`;
    onSimularCustom([mutacion], nombre);
  };

  const renderSimboloNodo = (n: Nodo, fill: string, contorno: string, x: number, y: number): JSX.Element => {
    switch (n.tipo) {
      case "barrio":
        return (
          <g transform={`translate(${x - 14}, ${y - 14})`}>
            <circle cx="14" cy="14" r="14" fill={fill} stroke={contorno} strokeWidth="1.5" />
            {/* House Roof & Body Vector Path */}
            <path d="M 14 6 L 6 13 L 8 13 L 8 21 L 20 21 L 20 13 L 22 13 Z" fill="#FFFFFF" opacity={0.9} />
            <rect x="12" y="16" width="4" height="5" fill={fill} />
          </g>
        );
      case "perforacion":
        return (
          <g transform={`translate(${x - 12}, ${y - 12})`}>
            <circle cx="12" cy="12" r="12" fill={fill} stroke={contorno} strokeWidth="1.5" />
            {/* Water Drop Symbol */}
            <path d="M 12 5 C 9 9, 7 12, 7 15 A 5 5 0 0 0 17 15 C 17 12, 15 9, 12 5 Z" fill="#FFFFFF" />
          </g>
        );
      case "acueducto":
        return (
          <g transform={`translate(${x - 15}, ${y - 15})`}>
            <rect x="2" y="2" width="26" height="26" rx="4" fill={fill} stroke={contorno} strokeWidth="1.5" />
            <path d="M 6 15 L 22 15 M 17 10 L 22 15 L 17 20" stroke="#FFFFFF" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        );
      case "tanque":
        return (
          <g transform={`translate(${x - 14}, ${y - 14})`}>
            <rect x="3" y="3" width="22" height="22" rx="3" fill={fill} stroke={contorno} strokeWidth="1.5" />
            <rect x="7" y="12" width="14" height="9" fill="#FFFFFF" opacity={0.85} rx="1" />
            <line x1="7" y1="9" x2="21" y2="9" stroke="#FFFFFF" strokeWidth="2" />
          </g>
        );
      case "bomba":
        return (
          <g transform={`translate(${x - 13}, ${y - 13})`}>
            <circle cx="13" cy="13" r="13" fill={fill} stroke={contorno} strokeWidth="1.5" />
            {/* Turbine / Pump Blade Icon */}
            <circle cx="13" cy="13" r="5" fill="#FFFFFF" />
            <path d="M 13 4 L 13 22 M 4 13 L 22 13" stroke={fill} strokeWidth="2" />
          </g>
        );
      case "valvula":
        return (
          <g transform={`translate(${x - 13}, ${y - 13})`}>
            {/* Valve Diamond Shape */}
            <polygon points="13,2 24,13 13,24 2,13" fill={fill} stroke={contorno} strokeWidth="1.5" />
            <circle cx="13" cy="13" r="3.5" fill="#FFFFFF" />
          </g>
        );
      default:
        return <circle cx={x} cy={y} r={10} fill={fill} stroke={contorno} strokeWidth="1.5" />;
    }
  };

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
      {/* GIS HUD Control Panel Bar & Legend */}
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
            background: "rgba(14,20,26,0.95)",
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

        {/* Node Type Legend */}
        <div style={{ background: "rgba(14,20,26,0.92)", border: "1px solid #3d4a3f", padding: "6px 10px", borderRadius: 2, display: "flex", flexWrap: "wrap", gap: 10, fontSize: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 13, color: COLOR_NODO_BASE.barrio }}>home</span>
            <span>Hogares</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 13, color: COLOR_NODO_BASE.perforacion }}>water_drop</span>
            <span>Pozo</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 13, color: COLOR_NODO_BASE.acueducto }}>pipeline</span>
            <span>Acueducto</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 13, color: COLOR_NODO_BASE.tanque }}>water_full</span>
            <span>Tanque</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 13, color: COLOR_NODO_BASE.bomba }}>bolt</span>
            <span>Bomba</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 13, color: COLOR_NODO_BASE.valvula }}>tune</span>
            <span>Válvula</span>
          </div>
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

      {/* Interactive Node Property Inspector Drawer tailored per node type */}
      {nodoSeleccionado && (
        <div
          style={{
            position: "absolute",
            bottom: 16,
            left: 16,
            zIndex: 40,
            backgroundColor: "rgba(16, 27, 46, 0.98)",
            border: `1px solid ${COLOR_NODO_BASE[nodoSeleccionado.tipo]}`,
            padding: 16,
            borderRadius: 6,
            width: 330,
            color: "#E2E8F0",
            fontSize: 12,
            boxShadow: "0 12px 32px rgba(0,0,0,0.8)",
            backdropFilter: "blur(12px)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, borderBottom: "1px solid #1E293B", paddingBottom: 6 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 18, color: COLOR_NODO_BASE[nodoSeleccionado.tipo] }}>
                {INFO_TIPO_NODO[nodoSeleccionado.tipo]?.iconoMaterial}
              </span>
              <span style={{ fontWeight: 900, fontSize: 14, color: "#E2E8F0" }}>{nodoSeleccionado.nombre}</span>
            </div>
            <button onClick={() => setNodoSeleccionado(null)} style={{ background: "none", border: "none", color: "#94A3B8", cursor: "pointer", fontSize: 16 }}>✕</button>
          </div>

          <div style={{ fontSize: 11, color: COLOR_NODO_BASE[nodoSeleccionado.tipo], fontWeight: "bold", marginBottom: 4 }}>
            {INFO_TIPO_NODO[nodoSeleccionado.tipo]?.titulo}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 12 }}>
            <div style={{ fontSize: 11, color: "#bccabc" }}>{INFO_TIPO_NODO[nodoSeleccionado.tipo]?.descripcion}</div>
            <div>Zona: <strong>{nodoSeleccionado.zona.toUpperCase()}</strong></div>
            {nodoSeleccionado.usuarios ? <div>Hogares / Población: <strong>{nodoSeleccionado.usuarios.toLocaleString("es-AR")} hab.</strong></div> : null}
            {nodoSeleccionado.caudalHorarioM3 ? <div>Caudal Nominal: <strong>{nodoSeleccionado.caudalHorarioM3} m³/h</strong></div> : null}
            {nodoSeleccionado.m3Dia ? <div>Demanda Estimada: <strong>{nodoSeleccionado.m3Dia} m³/día</strong></div> : null}
          </div>

          {/* Tailored Failure Simulation Controls */}
          <div style={{ backgroundColor: "#161C22", border: "1px solid #1E293B", borderRadius: 4, padding: 10 }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: "#51df8e", letterSpacing: "0.05em", marginBottom: 6 }}>
              SIMULACIÓN DE IMPACTO ESPECÍFICO DE TIPO
            </div>

            <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
              <button
                onClick={() => setAccionSimulada("falla")}
                style={{
                  flex: 1,
                  padding: "6px 6px",
                  fontSize: 10,
                  fontWeight: "bold",
                  borderRadius: 2,
                  border: "none",
                  backgroundColor: accionSimulada === "falla" ? "#D92D20" : "#1a2026",
                  color: "#E2E8F0",
                  cursor: "pointer",
                }}
              >
                🔴 FALLA / CORTE
              </button>
              {nodoSeleccionado.tipo === "valvula" && (
                <>
                  <button
                    onClick={() => setAccionSimulada("cierre")}
                    style={{
                      flex: 1,
                      padding: "6px 6px",
                      fontSize: 10,
                      fontWeight: "bold",
                      borderRadius: 2,
                      border: "none",
                      backgroundColor: accionSimulada === "cierre" ? "#F79009" : "#1a2026",
                      color: "#E2E8F0",
                      cursor: "pointer",
                    }}
                  >
                    🟠 CIERRE
                  </button>
                  <button
                    onClick={() => setAccionSimulada("apertura")}
                    style={{
                      flex: 1,
                      padding: "6px 6px",
                      fontSize: 10,
                      fontWeight: "bold",
                      borderRadius: 2,
                      border: "none",
                      backgroundColor: accionSimulada === "apertura" ? "#12B76A" : "#1a2026",
                      color: "#E2E8F0",
                      cursor: "pointer",
                    }}
                  >
                    🟢 APERTURA
                  </button>
                </>
              )}
            </div>

            <button
              onClick={() => {
                ejecutarSimulacionNodo(nodoSeleccionado, accionSimulada);
                setNodoSeleccionado(null);
              }}
              style={{
                width: "100%",
                backgroundColor: "#51df8e",
                color: "#00391d",
                fontWeight: 900,
                fontSize: 11,
                padding: "8px 12px",
                border: "none",
                borderRadius: 4,
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(81,223,142,0.3)",
              }}
            >
              SIMULAR {accionSimulada.toUpperCase()} DE {nodoSeleccionado.tipo.toUpperCase()} 🚀
            </button>
          </div>
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

            {/* Distinct Node Vector Symbols */}
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
                  {is3D && <ellipse cx={p.x} cy={p.y + 14} rx={14} ry={7} fill="#000000" opacity={0.6} />}

                  {sev === "sin_servicio" && (
                    <circle cx={p.x} cy={p.y} r={22} fill="none" stroke="#D92D20" strokeWidth={1.5} opacity={0.75}>
                      <animate attributeName="r" values="14;26;14" dur="2s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.9;0.2;0.9" dur="2s" repeatCount="indefinite" />
                    </circle>
                  )}
                  {sev === "baja_presion" && (
                    <circle cx={p.x} cy={p.y} r={18} fill="none" stroke="#F79009" strokeWidth={1} opacity={0.5}>
                      <animate attributeName="r" values="12;20;12" dur="3s" repeatCount="indefinite" />
                    </circle>
                  )}

                  {/* Render Custom Vector Icon per Node Type */}
                  {renderSimboloNodo(n, fill, contorno, p.x, p.y)}

                  <title>{n.nombre}</title>
                  {etiquetas && n.tipo === "barrio" && (
                    <text
                      x={p.x}
                      y={p.y + 26}
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
