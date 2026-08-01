"use client";

import { useState, useRef, useCallback, type JSX, type MouseEvent, type WheelEvent } from "react";
import type { Arista, EstadoNodo, Mutacion, Nodo, Severidad, TipoNodo } from "../lib/types";

export interface NetworkViewProps {
  nodos: Nodo[];
  aristas: Arista[];
  severidad?: Record<string, Severidad>;
  nodosEstado?: Record<string, EstadoNodo>;
  etiquetas?: boolean;
  onSimularCustom?: (mutaciones: Mutacion[], nombreCustom: string) => void;
}

const ANCHO = 1600;
const ALTO = 1000;

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
  // Oeste (Sanagasta & Las Padercitas)
  "acu-dique-los-sauces": { x: 80, y: 70 },
  "planta-padercitas": { x: 160, y: 110 },
  "valvula-padercitas": { x: 250, y: 150 },
  "acu-sanagasta": { x: 320, y: 110 },
  "valvula-sanagasta": { x: 410, y: 110 },
  "tanque-oeste": { x: 350, y: 240 },
  "barrio-faldeo-del-velasco": { x: 500, y: 260 },
  "dist-oeste": { x: 350, y: 420 },

  "perf-plaza-pesebre": { x: 80, y: 220 },
  "perf-cochangasta": { x: 80, y: 290 },
  "perf-unlar": { x: 80, y: 360 },
  "perf-colegio-medico": { x: 80, y: 430 },
  "perf-b-municipal": { x: 80, y: 500 },
  "perf-circunvalacion": { x: 80, y: 570 },
  "perf-parque-ciudad": { x: 80, y: 640 },

  "valvula-rama-alta": { x: 520, y: 160 },
  "barrio-san-nicolas": { x: 670, y: 120 },
  "barrio-don-bosco": { x: 670, y: 220 },

  // Centro
  "barrio-vargas": { x: 680, y: 320 },
  "perf-vargas": { x: 580, y: 390 },
  "valvula-dist-centro": { x: 580, y: 460 },
  "barrio-centro": { x: 520, y: 360 },
  "tanque-central": { x: 700, y: 500 },

  // Este
  "valvula-este": { x: 920, y: 460 },
  "acu-zona-este": { x: 1140, y: 460 },
  "dist-este": { x: 1360, y: 460 },
  "barrio-yacampis": { x: 1480, y: 320 },
  "barrio-la-rodadera": { x: 1480, y: 460 },
  "barrio-centro-comercial": { x: 1480, y: 600 },
  "perf-parque-industrial": { x: 1300, y: 640 },
  "barrio-parque-industrial": { x: 1480, y: 680 },

  // Interconexiones
  "valvula-inter-sur-oeste": { x: 580, y: 570 },
  "valvula-inter-sur-este": { x: 780, y: 590 },

  // Sur
  "dist-sur": { x: 850, y: 700 },
  "bomba-sur": { x: 1050, y: 700 },
  "valvula-cactus": { x: 850, y: 800 },
  "perf-copegraf": { x: 100, y: 880 },
  "perf-lawn-tenis": { x: 250, y: 880 },
  "perf-las-talas": { x: 400, y: 880 },
  "perf-parque-familia": { x: 550, y: 880 },
  "perf-los-cactus": { x: 700, y: 880 },

  "barrio-procrear": { x: 700, y: 950 },
  "barrio-nk-alta": { x: 830, y: 950 },
  "barrio-las-talas-alta": { x: 960, y: 950 },
  "barrio-virgen-de-guadalupe": { x: 1050, y: 950 },
  "barrio-luis-vernet": { x: 1180, y: 790 },
  "barrio-el-mirador": { x: 1300, y: 790 },
  "barrio-coop-santa-rosa": { x: 1420, y: 790 },
  "barrio-susana-quintela": { x: 1180, y: 880 },
  "barrio-rivadavia": { x: 1300, y: 880 },
  "barrio-emp-telecom": { x: 1420, y: 880 },
  "barrio-circunvalacion": { x: 1180, y: 950 },
  "barrio-nueva-esperanza": { x: 1300, y: 950 },
  "barrio-san-cayetano": { x: 1420, y: 950 },
};

const ZONAS: Array<{ zona: string; x: number; y: number; w: number; h: number }> = [
  { zona: "OESTE (Sanagasta & Las Padercitas)", x: 30, y: 30, w: 600, h: 650 },
  { zona: "CENTRO (Vargas & Urbano)", x: 480, y: 280, w: 320, h: 300 },
  { zona: "ESTE (Acueducto & Parque Industrial)", x: 880, y: 260, w: 680, h: 460 },
  { zona: "SUR (Perforaciones & Los Cactus)", x: 30, y: 740, w: 1530, h: 240 },
];

function posicionNodo(nodo: Nodo): { x: number; y: number } {
  const fija = POSICIONES[nodo.id];
  if (fija) return fija;
  const porZona: Record<string, { x: number; y: number }> = {
    oeste: { x: 300, y: 400 },
    sur: { x: 800, y: 850 },
    este: { x: 1200, y: 500 },
    centro: { x: 600, y: 400 },
  };
  return porZona[nodo.zona] ?? { x: 800, y: 500 };
}

function etiquetaCorta(nombre: string): string {
  return nombre.replace(/^Barrio\s+/i, "").replace(/\s*\(.*?\)\s*$/g, "");
}

export default function NetworkView({
  nodos,
  aristas,
  severidad,
  nodosEstado,
  etiquetas = true,
  onSimularCustom,
}: NetworkViewProps) {
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState<number>(1.0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [is3D, setIs3D] = useState<boolean>(false);

  // Selected Node State
  const [nodoSeleccionado, setNodoSeleccionado] = useState<Nodo | null>(null);
  const [accionSimulada, setAccionSimulada] = useState<"falla" | "cierre" | "apertura">("falla");

  // Draggable Card State
  const [cardPos, setCardPos] = useState<{ x: number; y: number }>({ x: 100, y: 70 });
  const [isCardDragging, setIsCardDragging] = useState<boolean>(false);
  const [cardDragStart, setCardDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  }, [pan]);

  const handleMouseMove = useCallback((e: MouseEvent<HTMLDivElement>) => {
    if (isCardDragging) {
      setCardPos({ x: e.clientX - cardDragStart.x, y: e.clientY - cardDragStart.y });
      return;
    }
    if (isDragging) {
      setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    }
  }, [isCardDragging, cardDragStart, isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsCardDragging(false);
  }, []);

  const handleWheel = useCallback((e: WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.08 : 0.92;
    setZoom((prevZoom) => Math.min(Math.max(prevZoom * factor, 0.5), 3.0));
  }, []);

  const resetView = useCallback(() => {
    setPan({ x: 0, y: 0 });
    setZoom(1.0);
  }, []);

  const handleCardHeaderMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setIsCardDragging(true);
    setCardDragStart({ x: e.clientX - cardPos.x, y: e.clientY - cardPos.y });
  };

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
            <path d="M 14 6 L 6 13 L 8 13 L 8 21 L 20 21 L 20 13 L 22 13 Z" fill="#FFFFFF" opacity={0.9} />
            <rect x="12" y="16" width="4" height="5" fill={fill} />
          </g>
        );
      case "perforacion":
        return (
          <g transform={`translate(${x - 12}, ${y - 12})`}>
            <circle cx="12" cy="12" r="12" fill={fill} stroke={contorno} strokeWidth="1.5" />
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
            <circle cx="13" cy="13" r="5" fill="#FFFFFF" />
            <path d="M 13 4 L 13 22 M 4 13 L 22 13" stroke={fill} strokeWidth="2" />
          </g>
        );
      case "valvula":
        return (
          <g transform={`translate(${x - 13}, ${y - 13})`}>
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
      {/* GIS HUD Control Panel Bar & Complete Legend */}
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
          SYSTEM: LA_RIOJA_AMP_MAP (1600x1000 Canvas)
        </div>

        {/* Node Type & Pipeline Legend */}
        <div style={{ background: "rgba(14,20,26,0.92)", border: "1px solid #3d4a3f", padding: "6px 10px", borderRadius: 2, display: "flex", flexDirection: "column", gap: 6, fontSize: 10 }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
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
          
          <div style={{ borderTop: "1px solid #1E293B", paddingTop: 4, display: "flex", gap: 12, fontSize: 9, color: "#bccabc" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ width: 14, height: 2.5, backgroundColor: "#12B76A", display: "inline-block" }}></span>
              <span>Tubería Activa (Con flujo)</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ width: 14, height: 0, borderTop: "2px dashed #475569", display: "inline-block" }}></span>
              <span>Tubería Cerrada / Inactiva</span>
            </div>
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
          onClick={() => setZoom((z) => Math.max(z * 0.8, 0.5))}
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

      {/* DRAGGABLE Node Inspector Card Drawer - Moveable anywhere on screen */}
      {nodoSeleccionado && (
        <div
          style={{
            position: "fixed",
            left: cardPos.x,
            top: cardPos.y,
            zIndex: 100,
            backgroundColor: "rgba(14, 20, 26, 0.98)",
            border: `2px solid ${COLOR_NODO_BASE[nodoSeleccionado.tipo]}`,
            padding: 16,
            borderRadius: 8,
            width: 340,
            color: "#E2E8F0",
            fontSize: 12,
            boxShadow: "0 16px 40px rgba(0,0,0,0.9)",
            backdropFilter: "blur(16px)",
          }}
        >
          {/* Draggable Header Title Bar */}
          <div
            onMouseDown={handleCardHeaderMouseDown}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 10,
              borderBottom: "1px solid #1E293B",
              paddingBottom: 8,
              cursor: isCardDragging ? "grabbing" : "grab",
              backgroundColor: "rgba(22, 28, 34, 0.8)",
              margin: "-16px -16px 12px -16px",
              padding: "12px 16px 10px 16px",
              borderTopLeftRadius: 6,
              borderTopRightRadius: 6,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 18, color: COLOR_NODO_BASE[nodoSeleccionado.tipo] }}>
                {INFO_TIPO_NODO[nodoSeleccionado.tipo]?.iconoMaterial}
              </span>
              <span style={{ fontWeight: 900, fontSize: 14, color: "#E2E8F0" }}>{nodoSeleccionado.nombre}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 10, color: "#64748B", fontWeight: "bold" }}>ARRASTRAR 🖐</span>
              <button onClick={() => setNodoSeleccionado(null)} style={{ background: "none", border: "none", color: "#94A3B8", cursor: "pointer", fontSize: 16 }}>✕</button>
            </div>
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
              SIMULACIÓN DE IMPACTO DE NODO EN VIVO
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

      {/* Main Vector Map SVG Plane (1600 x 1000 Canvas) */}
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

            {/* Expanded Urban Street Network Lines (1600x1000) */}
            <g stroke="#1E293B" strokeWidth="1" opacity="0.6">
              <line x1={0} y1={200} x2={ANCHO} y2={200} stroke="#334155" strokeWidth={14} />
              <line x1={0} y1={460} x2={ANCHO} y2={460} stroke="#334155" strokeWidth={14} />
              <line x1={0} y1={720} x2={ANCHO} y2={720} stroke="#334155" strokeWidth={16} />
              <line x1={350} y1={0} x2={350} y2={ALTO} stroke="#334155" strokeWidth={12} />
              <line x1={900} y1={0} x2={900} y2={ALTO} stroke="#334155" strokeWidth={14} />
            </g>

            {/* Residential Blocks */}
            <g fill="#161C22" stroke="#1E293B" strokeWidth="1">
              <rect x={120} y={220} width={80} height={50} rx={3} />
              <rect x={220} y={220} width={80} height={50} rx={3} />
              <rect x={120} y={300} width={80} height={50} rx={3} />
              <rect x={220} y={300} width={80} height={50} rx={3} />
              <rect x={940} y={220} width={90} height={60} rx={3} />
              <rect x={1050} y={220} width={90} height={60} rx={3} />
              <rect x={940} y={750} width={80} height={50} rx={3} />
              <rect x={1040} y={750} width={80} height={50} rx={3} />
            </g>

            {/* 3D Shadows */}
            {is3D && (
              <g fill="#1E293B" opacity="0.8">
                <polygon points="120,270 200,270 200,282 120,282" />
                <polygon points="220,270 300,270 300,282 220,282" />
                <polygon points="940,280 1030,280 1030,295 940,295" />
              </g>
            )}

            {/* Street Labels */}
            <g fill="#64748B" fontFamily="Inter" fontSize="11" fontWeight="bold" letterSpacing="0.1em">
              <text x={40} y={188}>AV. SANAGASTA / RAMÍREZ DE VELASCO</text>
              <text x={40} y={448}>CALLE BAZÁN Y BUSTOS</text>
              <text x={40} y={708}>AV. LOS CACTUS / AV. CIRCUNVALACIÓN</text>
              <text transform="rotate(90, 340, 50)" x={340} y={50}>AV. FACUNDO QUIROGA</text>
              <text transform="rotate(90, 890, 50)" x={890} y={50}>AV. ORTIZ DE OCAMPO</text>
            </g>

            {/* Zones */}
            {ZONAS.map((z) => (
              <g key={z.zona}>
                <rect x={z.x} y={z.y} width={z.w} height={z.h} fill="#161C22" opacity={0.35} rx={4} stroke="#1E293B" strokeWidth={1} />
                <text x={z.x + 12} y={z.y + 22} fontSize={11} fontWeight="bold" fill="#51df8e" letterSpacing={2}>
                  SECTOR {z.zona}
                </text>
              </g>
            ))}

            {/* Pipelines (Green = Active Flow; Dashed Gray = Closed / Cut) */}
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
                  strokeWidth={cerrada ? 1.8 : 3}
                  strokeDasharray={cerrada ? "5 5" : undefined}
                  opacity={cerrada ? 0.4 : 0.85}
                  markerEnd={cerrada ? undefined : "url(#flecha)"}
                />
              );
            })}

            {/* Distinct Node Vector Symbols */}
            {nodos.map((n) => {
              const p = posicionNodo(n);
              const sev = severidad?.[n.id];
              const estadoEspecifico = nodosEstado?.[n.id] ?? n.estado;
              const esSeleccionado = nodoSeleccionado?.id === n.id;

              const fill =
                estadoEspecifico === "fallado"
                  ? "#D92D20"
                  : estadoEspecifico === "cerrado"
                  ? "#F79009"
                  : sev
                  ? COLORES_SEVERIDAD[sev]
                  : COLOR_NODO_BASE[n.tipo] ?? "#94A3B8";

              const contorno = esSeleccionado ? "#51df8e" : "#E2E8F0";

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

                  {/* HIGH VISIBILITY SELECTION HIGHLIGHT RINGS & CROSSHAIR */}
                  {esSeleccionado && (
                    <g>
                      {/* Rotating Neon Green Outer Ring */}
                      <circle cx={p.x} cy={p.y} r={32} fill="none" stroke="#51df8e" strokeWidth="2.5" strokeDasharray="6 3">
                        <animate attributeName="stroke-dashoffset" values="0;18" dur="1s" repeatCount="indefinite" />
                        <animate attributeName="r" values="26;34;26" dur="1.5s" repeatCount="indefinite" />
                      </circle>
                      {/* Inner Glowing Aura */}
                      <circle cx={p.x} cy={p.y} r={22} fill="rgba(81, 223, 142, 0.25)" stroke="#51df8e" strokeWidth="1.5" />
                      {/* Target Crosshairs */}
                      <line x1={p.x - 38} y1={p.y} x2={p.x - 22} y2={p.y} stroke="#51df8e" strokeWidth="2" />
                      <line x1={p.x + 22} y1={p.y} x2={p.x + 38} y2={p.y} stroke="#51df8e" strokeWidth="2" />
                      <line x1={p.x} y1={p.y - 38} x2={p.x} y2={p.y - 22} stroke="#51df8e" strokeWidth="2" />
                      <line x1={p.x} y1={p.y + 22} x2={p.x} y2={p.y + 38} stroke="#51df8e" strokeWidth="2" />

                      {/* Selected Node Badge Header */}
                      <g transform={`translate(${p.x - 45}, ${p.y - 42})`}>
                        <rect width="90" height="18" rx="3" fill="#51df8e" />
                        <text x="45" y="13" textAnchor="middle" fontSize="9" fontWeight="900" fill="#00391d" letterSpacing="0.08em">
                          SELECCIONADO
                        </text>
                      </g>
                    </g>
                  )}

                  {sev === "sin_servicio" && !esSeleccionado && (
                    <circle cx={p.x} cy={p.y} r={24} fill="none" stroke="#D92D20" strokeWidth={1.5} opacity={0.75}>
                      <animate attributeName="r" values="14;28;14" dur="2s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.9;0.2;0.9" dur="2s" repeatCount="indefinite" />
                    </circle>
                  )}
                  {sev === "baja_presion" && !esSeleccionado && (
                    <circle cx={p.x} cy={p.y} r={20} fill="none" stroke="#F79009" strokeWidth={1} opacity={0.5}>
                      <animate attributeName="r" values="12;22;12" dur="3s" repeatCount="indefinite" />
                    </circle>
                  )}

                  {/* Render Custom Vector Icon per Node Type */}
                  {renderSimboloNodo(n, fill, contorno, p.x, p.y)}

                  <title>{n.nombre}</title>
                  {etiquetas && n.tipo === "barrio" && (
                    <text
                      x={p.x}
                      y={p.y + (esSeleccionado ? 34 : 28)}
                      textAnchor="middle"
                      fontSize={11}
                      fontWeight="bold"
                      fill={esSeleccionado ? "#51df8e" : "#E2E8F0"}
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
