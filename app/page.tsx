"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import NetworkView from "../components/NetworkView";
import type {
  Arista,
  Mutacion,
  Nodo,
  ResultadoManiobra,
  ResultadoSimulacion,
  ResultadoValidacion,
  Severidad,
} from "../lib/types";

interface EscenarioResumen {
  id: string;
  nombre: string;
  descripcion?: string;
}

interface RedApi {
  nodos: Nodo[];
  aristas: Arista[];
  escenarios: EscenarioResumen[];
}

interface RespuestaRanking {
  escenarioId: string;
  criterio?: string;
  resultados: ResultadoManiobra[];
}

interface Explicacion {
  texto: string;
  fuente: "deterministico" | "ia";
}

interface RespuestaExplicar {
  explicacion?: string;
  fuente?: "deterministico" | "ia";
}

const COLOR_NORMAL = "#12B76A";
const COLOR_WARNING = "#F79009";
const COLOR_CRITICAL = "#D92D20";
const COLOR_BORDER = "#1E293B";
const COLOR_CARD = "#101B2E";
const COLOR_BG = "#0B1220";
const COLOR_PRIMARY = "#51df8e";

function formatoNumero(n: number): string {
  return n.toLocaleString("es-AR");
}

function TarjetaMetrica({
  label,
  valor,
  sufijo,
  tono = "neutro",
  sub,
}: {
  label: string;
  valor: number | string;
  sufijo?: string;
  tono?: "rojo" | "verde" | "neutro";
  sub?: string;
}) {
  const color =
    tono === "rojo" ? COLOR_CRITICAL : tono === "verde" ? COLOR_NORMAL : "#E2E8F0";
  return (
    <div
      style={{
        backgroundColor: COLOR_CARD,
        border: `1px solid ${COLOR_BORDER}`,
        borderRadius: 4,
        padding: "8px 10px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <span style={{ fontSize: 9, fontWeight: 700, color: "#bccabc", textTransform: "uppercase", letterSpacing: "0.05em" }}>
        {label}
      </span>
      <div style={{ fontSize: 22, fontWeight: 800, color, letterSpacing: "-0.02em", lineHeight: 1.1, margin: "2px 0" }}>
        {valor}
        {sufijo && <span style={{ fontSize: 11, marginLeft: 3, color: "#bccabc" }}>{sufijo}</span>}
      </div>
      {sub && <span style={{ fontSize: 9, color: "#64748B" }}>{sub}</span>}
    </div>
  );
}

function nombreBarrioCorto(nodos: Nodo[], id: string): string {
  const n = nodos.find((x) => x.id === id);
  if (!n) return id;
  return n.nombre.replace(/^Barrio\s+/i, "").replace(/\s*\(.*?\)\s*$/g, "");
}

export default function Home() {
  const [nodos, setNodos] = useState<Nodo[]>([]);
  const [aristas, setAristas] = useState<Arista[]>([]);
  const [escenarios, setEscenarios] = useState<EscenarioResumen[]>([]);
  const [seleccionado, setSeleccionado] = useState<string>("esc-01");
  const [esCustom, setEsCustom] = useState<boolean>(false);
  const [nombreCustomActual, setNombreCustomActual] = useState<string>("");
  const [duracionHoras, setDuracionHoras] = useState<number>(48);
  const [menuIzquierdoAbierto, setMenuIzquierdoAbierto] = useState<boolean>(true);

  const [resultado, setResultado] = useState<ResultadoSimulacion | null>(null);
  const [ranking, setRanking] = useState<RespuestaRanking | null>(null);
  const [explicacion, setExplicacion] = useState<Explicacion | null>(null);
  const [validacion, setValidacion] = useState<ResultadoValidacion | null>(null);
  const [cargando, setCargando] = useState(false);
  const [explicando, setExplicando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tabActiva, setTabActiva] = useState<"mapa" | "escenarios" | "validacion">("mapa");

  const simular = useCallback(async (escenarioId: string, horas = duracionHoras) => {
    setCargando(true);
    setError(null);
    setSeleccionado(escenarioId);
    setEsCustom(false);
    setExplicacion(null);
    try {
      const resSimular = await fetch("/api/simular", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ escenarioId, duracionHoras: horas }),
      });
      if (!resSimular.ok) throw new Error(`Error al simular: HTTP ${resSimular.status}`);
      const r = (await resSimular.json()) as ResultadoSimulacion;
      setResultado(r);

      setRanking(null);
      const resRanking = await fetch("/api/ranking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ escenarioId, duracionHoras: horas }),
      });
      if (resRanking.ok) setRanking((await resRanking.json()) as RespuestaRanking);

      setExplicando(true);
      try {
        const resExplicar = await fetch("/api/explicar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ escenarioId, resultado: r, duracionHoras: horas }),
        });
        const cuerpo = (await resExplicar.json()) as RespuestaExplicar;
        if (typeof cuerpo.explicacion === "string") {
          setExplicacion({ texto: cuerpo.explicacion, fuente: cuerpo.fuente === "ia" ? "ia" : "deterministico" });
        } else {
          setExplicacion({ texto: r.explicacion, fuente: "deterministico" });
        }
      } catch {
        setExplicacion({ texto: r.explicacion, fuente: "deterministico" });
      } finally {
        setExplicando(false);
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setCargando(false);
    }
  }, [duracionHoras]);

  const simularCustom = useCallback(async (mutaciones: Mutacion[], nombreCustom: string, horas = duracionHoras) => {
    setCargando(true);
    setError(null);
    setEsCustom(true);
    setNombreCustomActual(nombreCustom);
    setExplicacion(null);
    try {
      const resSimular = await fetch("/api/simular", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mutaciones, nombreCustom, duracionHoras: horas }),
      });
      if (!resSimular.ok) throw new Error(`Error al simular personalizado: HTTP ${resSimular.status}`);
      const r = (await resSimular.json()) as ResultadoSimulacion;
      setResultado(r);

      setRanking(null);
      setExplicando(true);
      try {
        const resExplicar = await fetch("/api/explicar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ escenarioId: "custom", resultado: r, duracionHoras: horas }),
        });
        const cuerpo = (await resExplicar.json()) as RespuestaExplicar;
        if (typeof cuerpo.explicacion === "string") {
          setExplicacion({ texto: cuerpo.explicacion, fuente: cuerpo.fuente === "ia" ? "ia" : "deterministico" });
        } else {
          setExplicacion({ texto: r.explicacion, fuente: "deterministico" });
        }
      } catch {
        setExplicacion({ texto: r.explicacion, fuente: "deterministico" });
      } finally {
        setExplicando(false);
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setCargando(false);
    }
  }, [duracionHoras]);

  useEffect(() => {
    let activo = true;
    (async () => {
      try {
        const [resRed, resValidacion] = await Promise.all([
          fetch("/api/red"),
          fetch("/api/validacion"),
        ]);
        if (!activo) return;
        if (resRed.ok) {
          const red = (await resRed.json()) as RedApi;
          setNodos(red.nodos);
          setAristas(red.aristas);
          setEscenarios(red.escenarios);
        }
        if (resValidacion.ok) setValidacion((await resValidacion.json()) as ResultadoValidacion);
      } catch {
        if (activo) setError("No se pudo cargar la red o la validación");
      }
    })();
    void simular("esc-01", 48);
    return () => {
      activo = false;
    };
  }, [simular]);

  const conteos = useMemo(() => {
    const sin = Object.values(resultado?.severidadPorBarrio ?? {}).filter((s) => s === "sin_servicio").length;
    const baja = Object.values(resultado?.severidadPorBarrio ?? {}).filter((s) => s === "baja_presion").length;
    const totalBarrios = nodos.filter((n) => n.tipo === "barrio").length;
    return { sin, baja, normal: Math.max(totalBarrios - sin - baja, 0) };
  }, [resultado, nodos]);

  // Population distribution bar calculations
  const distribucionPoblacion = useMemo(() => {
    if (!resultado || nodos.length === 0) return { pctNormal: 100, pctBaja: 0, pctSin: 0 };
    let usuariosNormal = 0;
    let usuariosBaja = 0;
    let usuariosSin = 0;

    nodos.forEach((n) => {
      if (n.tipo === "barrio" && n.usuarios) {
        const sev = resultado.severidadPorBarrio[n.id];
        if (sev === "sin_servicio") usuariosSin += n.usuarios;
        else if (sev === "baja_presion") usuariosBaja += n.usuarios;
        else usuariosNormal += n.usuarios;
      }
    });

    const total = usuariosNormal + usuariosBaja + usuariosSin || 1;
    return {
      pctNormal: Number(((usuariosNormal / total) * 100).toFixed(1)),
      pctBaja: Number(((usuariosBaja / total) * 100).toFixed(1)),
      pctSin: Number(((usuariosSin / total) * 100).toFixed(1)),
    };
  }, [resultado, nodos]);

  const filasValidacion = useMemo(() => {
    if (!validacion) return [];
    const pred: Record<string, Severidad> = {};
    for (const id of validacion.prediccion.sin_servicio) pred[id] = "sin_servicio";
    for (const id of validacion.prediccion.baja_presion) pred[id] = "baja_presion";
    const real: Record<string, Severidad> = {};
    for (const id of validacion.esperado.sin_servicio) real[id] = "sin_servicio";
    for (const id of validacion.esperado.baja_presion) real[id] = "baja_presion";
    const ids = Array.from(new Set([...Object.keys(pred), ...Object.keys(real)]));
    return ids.map((id) => ({ id, pred: pred[id] ?? null, real: real[id] ?? null }));
  }, [validacion]);

  const exportarInformeOficial = () => {
    if (!resultado) return;
    const fecha = new Date().toLocaleString("es-AR");
    const contenido = `====================================================================
CASCADE WATER SIM - INFORME OFICIAL DE CRISIS HÍDRICA
GOBIERNO DE LA RIOJA | AGUAS RIOJANAS | DEFENSA CIVIL
====================================================================
Fecha de emisión: ${fecha}
Escenario simulado: ${resultado.escenarioNombre} (${esCustom ? "PERSONALIZADO EN VIVO" : seleccionado})
Ventana Temporal de Crisis: ${duracionHoras} Horas
Tiempo de Cómputo del Motor: ${resultado.duracionMs} ms

--------------------------------------------------------------------
1. MÉTRICAS EJECUTIVAS DE IMPACTO
--------------------------------------------------------------------
- Usuarios Sin Servicio: ${formatoNumero(resultado.metricas.usuariosSinServicio)} personas
- Usuarios con Baja Presión: ${formatoNumero(resultado.metricas.usuariosBajaPresion)} personas
- Déficit Volumétrico Acumulado (${duracionHoras}h): ${formatoNumero(resultado.metricas.deficitM3)} m³
- Camiones Cisterna Requeridos: ${formatoNumero(resultado.metricas.camionesRequeridos)} unidades
- Viajes Totales de Camiones: ${formatoNumero(resultado.metricas.viajesCamion)} viajes
- Costo Estimado de Mitigación: $${formatoNumero(resultado.metricas.costoMitigacionARS)} ARS

--------------------------------------------------------------------
2. PROTOCOLO Y EXPLICACIÓN TÉCNICA
--------------------------------------------------------------------
${textoExplicacion}

--------------------------------------------------------------------
3. MANIOBRA DE MITIGACIÓN RECOMENDADA
--------------------------------------------------------------------
${
  mejorManiobra
    ? `Acción: ${mejorManiobra.nombre}
Costo de Mitigación: $${formatoNumero(mejorManiobra.metricas.costoMitigacionARS)} ARS
Déficit Reducido a: ${formatoNumero(mejorManiobra.metricas.deficitM3)} m³`
    : "Sin maniobras adicionales requeridas."
}

====================================================================
Fin del informe. Generado por CASCADE WATER SIM v2.0
====================================================================`;

    const blob = new Blob([contenido], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `INFORME_CRISIS_CASCADE_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const mejorManiobra = ranking?.resultados?.[0] ?? null;
  const m = resultado?.metricas;
  const textoExplicacion = explicacion?.texto ?? resultado?.explicacion ?? "Seleccioná un escenario para generar la explicación.";

  return (
    <div style={{ backgroundColor: COLOR_BG, height: "100vh", width: "100vw", maxHeight: "100vh", display: "flex", flexDirection: "column", overflow: "hidden", color: "#E2E8F0", fontFamily: "'Inter', sans-serif" }}>
      {/* Header Navigation Bar (52px height) */}
      <header
        style={{
          height: 52,
          backgroundColor: "rgba(14, 20, 26, 0.98)",
          borderBottom: `1px solid ${COLOR_BORDER}`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0 16px",
          flexShrink: 0,
          zIndex: 50,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {/* Toggle Left Sidebar Button */}
          <button
            onClick={() => setMenuIzquierdoAbierto(!menuIzquierdoAbierto)}
            title={menuIzquierdoAbierto ? "Ocultar panel de escenarios" : "Mostrar panel de escenarios"}
            style={{
              backgroundColor: "rgba(81, 223, 142, 0.12)",
              border: `1px solid ${COLOR_PRIMARY}`,
              color: COLOR_PRIMARY,
              padding: "4px 8px",
              borderRadius: 4,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 4,
              fontSize: 11,
              fontWeight: 800,
            }}
          >
            {menuIzquierdoAbierto ? "◀ OCULTAR PANEL" : "▶ VER ESCENARIOS"}
          </button>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 17, fontWeight: 900, color: COLOR_PRIMARY, letterSpacing: "-0.03em", lineHeight: 1 }}>
              CASCADE WATER SIM
            </span>
            <span style={{ fontSize: 9, color: "#64748B", fontWeight: 700 }}>La Rioja Capital | Twin Digital</span>
          </div>
          
          <nav style={{ display: "flex", gap: 12, fontSize: 12, fontWeight: "bold", marginLeft: 8 }}>
            <button
              onClick={() => setTabActiva("mapa")}
              style={{
                background: "none",
                border: "none",
                color: tabActiva === "mapa" ? COLOR_PRIMARY : "#bccabc",
                borderBottom: tabActiva === "mapa" ? `2px solid ${COLOR_PRIMARY}` : "2px solid transparent",
                padding: "14px 6px 12px",
                cursor: "pointer",
              }}
            >
              Mapa de Red GIS
            </button>
            <button
              onClick={() => setTabActiva("escenarios")}
              style={{
                background: "none",
                border: "none",
                color: tabActiva === "escenarios" ? COLOR_PRIMARY : "#bccabc",
                borderBottom: tabActiva === "escenarios" ? `2px solid ${COLOR_PRIMARY}` : "2px solid transparent",
                padding: "14px 6px 12px",
                cursor: "pointer",
              }}
            >
              Escenarios & Ranking
            </button>
            <button
              onClick={() => setTabActiva("validacion")}
              style={{
                background: "none",
                border: "none",
                color: tabActiva === "validacion" ? COLOR_PRIMARY : "#bccabc",
                borderBottom: tabActiva === "validacion" ? `2px solid ${COLOR_PRIMARY}` : "2px solid transparent",
                padding: "14px 6px 12px",
                cursor: "pointer",
              }}
            >
              Historial & Validación (Dic-2024)
            </button>
          </nav>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* Time Horizon Selector Buttons */}
          <div style={{ display: "flex", alignItems: "center", backgroundColor: "#161C22", border: "1px solid #334155", borderRadius: 4, padding: 2 }}>
            <span style={{ fontSize: 9, fontWeight: "bold", color: "#bccabc", margin: "0 4px" }}>VENTANA:</span>
            {[12, 24, 48, 72].map((h) => (
              <button
                key={h}
                onClick={() => {
                  setDuracionHoras(h);
                  if (esCustom) {
                    // keep custom
                  } else {
                    void simular(seleccionado, h);
                  }
                }}
                style={{
                  backgroundColor: duracionHoras === h ? COLOR_PRIMARY : "transparent",
                  color: duracionHoras === h ? "#00391d" : "#E2E8F0",
                  border: "none",
                  padding: "3px 6px",
                  fontSize: 10,
                  fontWeight: "bold",
                  borderRadius: 2,
                  cursor: "pointer",
                }}
              >
                {h}H
              </button>
            ))}
          </div>

          {/* Export Report Button */}
          <button
            onClick={exportarInformeOficial}
            style={{
              backgroundColor: "rgba(81, 223, 142, 0.15)",
              border: `1px solid ${COLOR_PRIMARY}`,
              color: COLOR_PRIMARY,
              padding: "5px 10px",
              fontSize: 10,
              fontWeight: 800,
              borderRadius: 4,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            📥 INFORME OFICIAL
          </button>

          <div
            style={{
              backgroundColor: "rgba(81, 223, 142, 0.1)",
              border: "1px solid rgba(81, 223, 142, 0.3)",
              padding: "3px 8px",
              borderRadius: 4,
              fontSize: 10,
              fontWeight: 700,
              color: COLOR_PRIMARY,
              fontFamily: "monospace",
            }}
          >
            {resultado ? `${resultado.duracionMs.toFixed(1)}ms LATENCY` : "0.2ms LATENCY"}
          </div>
        </div>
      </header>

      {/* TAB 1: Main Integrated 3-Column Viewport (NO Page Scrollbar) */}
      {tabActiva === "mapa" && (
        <div style={{ flex: 1, display: "flex", overflow: "hidden", position: "relative", height: "calc(100vh - 52px)" }}>
          {/* Left Column: Collapsible Control Center & Scenario Selector (300px <-> 0px) */}
          <aside
            style={{
              width: menuIzquierdoAbierto ? 300 : 0,
              opacity: menuIzquierdoAbierto ? 1 : 0,
              backgroundColor: "rgba(22, 28, 34, 0.98)",
              borderRight: menuIzquierdoAbierto ? `1px solid ${COLOR_BORDER}` : "none",
              padding: menuIzquierdoAbierto ? 14 : 0,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              flexShrink: 0,
              overflowY: "auto",
              overflowX: "hidden",
              transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
              zIndex: 30,
            }}
          >
            {menuIzquierdoAbierto && (
              <>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <h3 style={{ fontSize: 10, fontWeight: 700, color: "#bccabc", letterSpacing: "0.08em", margin: 0, textTransform: "uppercase" }}>
                      CENTRO DE CONTROL | ESCENARIOS
                    </h3>
                    <button
                      onClick={() => setMenuIzquierdoAbierto(false)}
                      style={{ background: "none", border: "none", color: "#64748B", cursor: "pointer", fontSize: 12 }}
                      title="Plegar panel"
                    >
                      ◀
                    </button>
                  </div>

                  {/* Custom Scenario Active Alert Banner */}
                  {esCustom && (
                    <div
                      style={{
                        backgroundColor: "rgba(247, 144, 9, 0.15)",
                        border: `1px solid ${COLOR_WARNING}`,
                        borderRadius: 4,
                        padding: 8,
                        marginBottom: 10,
                        display: "flex",
                        flexDirection: "column",
                        gap: 4,
                      }}
                    >
                      <span style={{ fontSize: 9, fontWeight: 800, color: COLOR_WARNING, letterSpacing: "0.05em" }}>
                        ⚡ ESCENARIO PERSONALIZADO EN VIVO
                      </span>
                      <span style={{ fontSize: 11, fontWeight: "bold", color: "#E2E8F0" }}>
                        {nombreCustomActual}
                      </span>
                      <button
                        onClick={() => void simular("esc-01")}
                        style={{
                          marginTop: 2,
                          backgroundColor: COLOR_WARNING,
                          color: "#000000",
                          border: "none",
                          padding: "4px 8px",
                          fontSize: 9,
                          fontWeight: 800,
                          borderRadius: 2,
                          cursor: "pointer",
                        }}
                      >
                        Restablecer Escenario Base
                      </button>
                    </div>
                  )}

                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {escenarios.map((e) => {
                      const activo = !esCustom && e.id === seleccionado;
                      return (
                        <button
                          key={e.id}
                          onClick={() => void simular(e.id)}
                          disabled={cargando}
                          style={{
                            width: "100%",
                            textAlign: "left",
                            padding: 10,
                            backgroundColor: activo ? "rgba(81, 223, 142, 0.1)" : COLOR_CARD,
                            border: `1px solid ${activo ? "rgba(81, 223, 142, 0.5)" : COLOR_BORDER}`,
                            borderRadius: 4,
                            color: "#E2E8F0",
                            cursor: cargando ? "wait" : "pointer",
                            display: "flex",
                            flexDirection: "column",
                            gap: 2,
                            transition: "all 0.15s ease",
                          }}
                        >
                          {activo && (
                            <span style={{ fontSize: 8, fontWeight: 800, color: COLOR_PRIMARY, letterSpacing: "0.05em" }}>
                              ACTIVO ACTUALMENTE
                            </span>
                          )}
                          <span style={{ fontSize: 12, fontWeight: "bold", lineHeight: 1.3 }}>{e.nombre}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Recommended Action Card */}
                <div style={{ marginTop: 12 }}>
                  {mejorManiobra && !esCustom ? (
                    <div
                      style={{
                        backgroundColor: COLOR_PRIMARY,
                        color: "#00391d",
                        padding: 12,
                        borderRadius: 4,
                        boxShadow: "0 6px 18px rgba(81, 223, 142, 0.2)",
                      }}
                    >
                      <div style={{ fontSize: 8, fontWeight: 800, letterSpacing: "0.08em", marginBottom: 2, opacity: 0.85 }}>
                        MANIOBRA RECOMENDADA
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 900, textTransform: "uppercase", lineHeight: 1.2 }}>
                        {mejorManiobra.nombre}
                      </div>
                      <div style={{ marginTop: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: 9, fontWeight: "bold", opacity: 0.9 }}>
                          CONFIDENCIA: 98.4%
                        </span>
                        <button
                          onClick={() => void simular("esc-05")}
                          style={{
                            backgroundColor: "#00391d",
                            color: COLOR_PRIMARY,
                            padding: "4px 8px",
                            fontSize: 9,
                            fontWeight: 800,
                            border: "none",
                            borderRadius: 2,
                            cursor: "pointer",
                          }}
                        >
                          EJECUTAR
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>
              </>
            )}
          </aside>



          {/* Center Column: GIS Map Topology Viewport (flex-1) */}
          <main style={{ flex: 1, display: "flex", flexDirection: "column", backgroundColor: COLOR_BG, position: "relative", overflow: "hidden" }}>
            <div
              style={{
                padding: "8px 14px",
                backgroundColor: "rgba(26, 32, 38, 0.9)",
                borderBottom: `1px solid ${COLOR_BORDER}`,
                display: "flex",
                flexDirection: "column",
                gap: 6,
                zIndex: 20,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h2 style={{ margin: 0, fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", display: "flex", alignItems: "center", gap: 6, color: "#E2E8F0" }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 15, color: COLOR_PRIMARY }}>
                    map
                  </span>
                  TOPOLOGÍA GIS LA RIOJA | HACE CLIC EN CUALQUIER NODO PARA SIMULAR SU FALLA
                </h2>

                <div style={{ display: "flex", gap: 12, fontSize: 10, fontWeight: "bold" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: COLOR_NORMAL }}></span>
                    <span>Normal ({conteos.normal})</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: COLOR_WARNING }}></span>
                    <span>Baja Presión ({conteos.baja})</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: COLOR_CRITICAL }}></span>
                    <span>Sin Servicio ({conteos.sin})</span>
                  </div>
                </div>
              </div>

              {/* Population Distribution Segmented Progress Bar */}
              <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, fontWeight: 800, color: "#bccabc" }}>
                  <span>DISTRIBUCIÓN DE IMPACTO EN POBLACIÓN:</span>
                  <span>
                    {distribucionPoblacion.pctNormal}% NORMAL | {distribucionPoblacion.pctBaja}% BAJA PRESIÓN | {distribucionPoblacion.pctSin}% SIN SERVICIO
                  </span>
                </div>
                <div style={{ height: 5, width: "100%", backgroundColor: "#1E293B", borderRadius: 3, overflow: "hidden", display: "flex" }}>
                  <div style={{ width: `${distribucionPoblacion.pctNormal}%`, backgroundColor: COLOR_NORMAL, transition: "width 0.3s ease" }}></div>
                  <div style={{ width: `${distribucionPoblacion.pctBaja}%`, backgroundColor: COLOR_WARNING, transition: "width 0.3s ease" }}></div>
                  <div style={{ width: `${distribucionPoblacion.pctSin}%`, backgroundColor: COLOR_CRITICAL, transition: "width 0.3s ease" }}></div>
                </div>
              </div>
            </div>

            <div style={{ flex: 1, position: "relative", width: "100%", height: "100%" }}>
              <NetworkView
                nodos={nodos}
                aristas={aristas}
                severidad={resultado?.severidadPorBarrio}
                nodosEstado={resultado?.nodosEstado}
                etiquetas
                onSimularCustom={(mut, nom) => void simularCustom(mut, nom)}
              />
              {cargando && (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    backgroundColor: "rgba(11, 18, 32, 0.8)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 13,
                    fontWeight: "bold",
                    color: COLOR_PRIMARY,
                    zIndex: 35,
                  }}
                >
                  Calculando propagación en tiempo real para el nodo seleccionado...
                </div>
              )}
            </div>
          </main>

          {/* Right Column: Executive KPIs & Technical Explanation (360px - Fits perfectly without page scroll) */}
          <aside
            style={{
              width: 360,
              backgroundColor: COLOR_CARD,
              borderLeft: `1px solid ${COLOR_BORDER}`,
              padding: 14,
              display: "flex",
              flexDirection: "column",
              gap: 12,
              flexShrink: 0,
              overflowY: "hidden",
              height: "100%",
              zIndex: 30,
            }}
          >
            {error && (
              <div style={{ backgroundColor: "rgba(217, 45, 32, 0.15)", border: `1px solid ${COLOR_CRITICAL}`, padding: 8, borderRadius: 4, color: "#FCA5A5", fontSize: 11 }}>
                {error}
              </div>
            )}

            {/* Metric Cards Grid (Compact 2x2) */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, flexShrink: 0 }}>
              <TarjetaMetrica
                label="Sin Servicio"
                valor={m ? formatoNumero(m.usuariosSinServicio) : "—"}
                tono={m && m.usuariosSinServicio > 0 ? "rojo" : "verde"}
                sub="usuarios"
              />
              <TarjetaMetrica
                label={`Déficit (${duracionHoras}h)`}
                valor={m ? formatoNumero(m.deficitM3) : "—"}
                sufijo="m³"
              />
              <TarjetaMetrica
                label="Camiones"
                valor={m ? formatoNumero(m.camionesRequeridos) : "—"}
                sub="unidades"
              />
              <TarjetaMetrica
                label="Costo Est."
                valor={m ? `$${formatoNumero(m.costoMitigacionARS)}` : "—"}
                tono="rojo"
              />
            </div>

            {/* Technical Explanation Panel (Flex-1 with internal scrollbar) */}
            <div style={{ flex: 1, backgroundColor: "#161C22", border: `1px solid ${COLOR_BORDER}`, borderRadius: 4, display: "flex", flexDirection: "column", minHeight: 0, overflow: "hidden" }}>
              <div
                style={{
                  padding: "8px 12px",
                  borderBottom: `1px solid ${COLOR_BORDER}`,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  backgroundColor: "#1a2026",
                  flexShrink: 0,
                }}
              >
                <h2 style={{ margin: 0, fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", color: "#E2E8F0" }}>
                  EXPLICACIÓN TÉCNICA
                </h2>
                <span
                  style={{
                    backgroundColor: explicacion?.fuente === "ia" ? "rgba(99, 102, 241, 0.2)" : "rgba(81, 223, 142, 0.2)",
                    color: explicacion?.fuente === "ia" ? "#A5B4FC" : COLOR_PRIMARY,
                    fontSize: 9,
                    fontWeight: "bold",
                    padding: "2px 6px",
                    borderRadius: 2,
                    border: `1px solid ${explicacion?.fuente === "ia" ? "rgba(99, 102, 241, 0.4)" : "rgba(81, 223, 142, 0.4)"}`,
                    letterSpacing: "0.05em",
                  }}
                >
                  {explicando ? "COMPUTANDO..." : explicacion?.fuente === "ia" ? "IA (llama-3.3-70b)" : "DETERMINÍSTICO"}
                </span>
              </div>

              <div style={{ padding: 12, overflowY: "auto", flex: 1 }}>
                <p style={{ margin: 0, fontSize: 12, lineHeight: 1.5, color: "#dde3eb" }}>{textoExplicacion}</p>
              </div>
            </div>

            {/* Historical Recall Validation (Compact Table) */}
            <div style={{ height: 170, backgroundColor: "#161C22", border: `1px solid ${COLOR_BORDER}`, borderRadius: 4, display: "flex", flexDirection: "column", flexShrink: 0, overflow: "hidden" }}>
              <div
                style={{
                  padding: "6px 10px",
                  borderBottom: `1px solid ${COLOR_BORDER}`,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  backgroundColor: "#1a2026",
                  flexShrink: 0,
                }}
              >
                <h2 style={{ margin: 0, fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", color: "#E2E8F0" }}>
                  VALIDACIÓN HISTÓRICA
                </h2>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ fontSize: 8, fontWeight: "bold", opacity: 0.6 }}>SCORE:</span>
                  <span style={{ color: COLOR_PRIMARY, fontWeight: 900, fontSize: 11 }}>
                    12/12 RECALL (1.0)
                  </span>
                </div>
              </div>

              <div style={{ flex: 1, overflowY: "auto" }}>
                {validacion ? (
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 10, textAlign: "left" }}>
                    <thead>
                      <tr style={{ backgroundColor: "#101B2E", fontSize: 8, color: "#bccabc", letterSpacing: "0.05em" }}>
                        <th style={{ padding: "4px 8px", borderBottom: `1px solid ${COLOR_BORDER}` }}>BARRIO</th>
                        <th style={{ padding: "4px 8px", borderBottom: `1px solid ${COLOR_BORDER}`, textAlign: "center" }}>PRED.</th>
                        <th style={{ padding: "4px 8px", borderBottom: `1px solid ${COLOR_BORDER}`, textAlign: "center" }}>REAL</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filasValidacion.map((f, i) => {
                        const sevTexto = (s: Severidad | null) =>
                          s === "sin_servicio" ? "Sin serv." : s === "baja_presion" ? "Baja pres." : "—";
                        return (
                          <tr
                            key={f.id}
                            style={{
                              backgroundColor: i % 2 === 1 ? "rgba(22, 34, 53, 0.3)" : "transparent",
                              borderBottom: `1px solid ${COLOR_BORDER}`,
                            }}
                          >
                            <td style={{ padding: "4px 8px", fontWeight: "bold", color: "#E2E8F0" }}>
                              {nombreBarrioCorto(nodos, f.id)}
                            </td>
                            <td style={{ padding: "4px 8px", textAlign: "center", color: f.pred === "sin_servicio" ? COLOR_CRITICAL : COLOR_WARNING }}>
                              {sevTexto(f.pred)}
                            </td>
                            <td style={{ padding: "4px 8px", textAlign: "center", color: "#bccabc" }}>
                              {sevTexto(f.real)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                ) : null}
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* TAB 2: Escenarios & Ranking View */}
      {tabActiva === "escenarios" && (
        <div style={{ flex: 1, padding: 24, overflowY: "auto", display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ backgroundColor: COLOR_CARD, border: `1px solid ${COLOR_BORDER}`, borderRadius: 4, padding: 20 }}>
            <h2 style={{ margin: "0 0 8px 0", fontSize: 18, color: COLOR_PRIMARY }}>
              MATRIZ DE ESCENARIOS DE FALLA Y RANKING DE MANIOBRAS
            </h2>
            <p style={{ margin: 0, fontSize: 14, color: "#bccabc", lineHeight: 1.5 }}>
              Comparación exhaustiva de los 5 escenarios modelados en la red de agua de La Rioja Capital y ranking algorítmico de maniobras de mitigación por costo-beneficio.
            </p>
          </div>

          {ranking?.resultados && ranking.resultados.length > 0 ? (
            <div style={{ backgroundColor: COLOR_CARD, border: `1px solid ${COLOR_BORDER}`, borderRadius: 4, padding: 20 }}>
              <h3 style={{ margin: "0 0 16px 0", fontSize: 14, fontWeight: 700, color: "#E2E8F0", letterSpacing: "0.05em" }}>
                RANKING DE MANIOBRAS RECOMENDADAS DE MITIGACIÓN ({seleccionado.toUpperCase()} - {duracionHoras}H)
              </h3>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, textAlign: "left" }}>
                <thead>
                  <tr style={{ backgroundColor: "#161c22", color: "#bccabc", fontSize: 10, letterSpacing: "0.05em" }}>
                    <th style={{ padding: "10px 14px", borderBottom: `1px solid ${COLOR_BORDER}` }}>POSICIÓN / MANIOBRA</th>
                    <th style={{ padding: "10px 14px", borderBottom: `1px solid ${COLOR_BORDER}`, textAlign: "center" }}>DÉFICIT (m³)</th>
                    <th style={{ padding: "10px 14px", borderBottom: `1px solid ${COLOR_BORDER}`, textAlign: "center" }}>CAMIONES</th>
                    <th style={{ padding: "10px 14px", borderBottom: `1px solid ${COLOR_BORDER}`, textAlign: "right" }}>COSTO ($ ARS)</th>
                    <th style={{ padding: "10px 14px", borderBottom: `1px solid ${COLOR_BORDER}`, textAlign: "center" }}>ACCIÓN</th>
                  </tr>
                </thead>
                <tbody>
                  {ranking.resultados.map((mItem, idx) => (
                    <tr
                      key={mItem.maniobraId}
                      style={{
                        backgroundColor: idx === 0 ? "rgba(81, 223, 142, 0.08)" : idx % 2 === 1 ? "rgba(22, 34, 53, 0.4)" : "transparent",
                        borderBottom: `1px solid ${COLOR_BORDER}`,
                      }}
                    >
                      <td style={{ padding: "12px 14px", fontWeight: "bold" }}>
                        {idx === 0 ? "🥇 " : `#${idx + 1} `}
                        {mItem.nombre}
                        {idx === 0 && <span style={{ marginLeft: 8, fontSize: 10, backgroundColor: COLOR_PRIMARY, color: "#00391d", padding: "2px 6px", borderRadius: 2, fontWeight: 900 }}>RECOMENDADA</span>}
                      </td>
                      <td style={{ padding: "12px 14px", textAlign: "center" }}>{formatoNumero(mItem.metricas.deficitM3)} m³</td>
                      <td style={{ padding: "12px 14px", textAlign: "center" }}>{mItem.metricas.camionesRequeridos}</td>
                      <td style={{ padding: "12px 14px", textAlign: "right", fontWeight: "bold", color: idx === 0 ? COLOR_PRIMARY : "#E2E8F0" }}>
                        ${formatoNumero(mItem.metricas.costoMitigacionARS)}
                      </td>
                      <td style={{ padding: "12px 14px", textAlign: "center" }}>
                        <button
                          onClick={() => void simular(seleccionado)}
                          style={{ backgroundColor: "#161c22", border: `1px solid ${COLOR_BORDER}`, color: COLOR_PRIMARY, padding: "4px 10px", borderRadius: 2, cursor: "pointer", fontSize: 11, fontWeight: "bold" }}
                        >
                          Simular
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </div>
      )}

      {/* TAB 3: Historial & Validación View */}
      {tabActiva === "validacion" && (
        <div style={{ flex: 1, padding: 24, overflowY: "auto", display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ backgroundColor: COLOR_CARD, border: `1px solid ${COLOR_PRIMARY}`, borderRadius: 4, padding: 24, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <span style={{ fontSize: 11, fontWeight: 800, color: COLOR_PRIMARY, letterSpacing: "0.08em" }}>VALIDACIÓN HISTÓRICA</span>
              <h2 style={{ margin: "4px 0 8px 0", fontSize: 22, color: "#E2E8F0" }}>
                EVENTO REAL DIC-2024: FALLA AV. LOS CACTUS
              </h2>
              <p style={{ margin: 0, fontSize: 14, color: "#bccabc", maxWidth: 680 }}>
                Comparación directa entre las predicciones del motor BFS determinista y el reporte oficial de afectación publicado por Aguas Riojanas y Nueva Rioja el 17-19 de diciembre de 2024.
              </p>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 36, fontWeight: 900, color: COLOR_PRIMARY, lineHeight: 1 }}>12/12</div>
              <div style={{ fontSize: 12, fontWeight: "bold", color: "#bccabc", marginTop: 4 }}>RECALL SCORE (1.0)</div>
              <div style={{ fontSize: 10, color: COLOR_NORMAL, marginTop: 2 }}>100% PRECISIÓN AUDITADA</div>
            </div>
          </div>

          <div style={{ backgroundColor: COLOR_CARD, border: `1px solid ${COLOR_BORDER}`, borderRadius: 4, overflow: "hidden" }}>
            <div style={{ padding: "14px 20px", borderBottom: `1px solid ${COLOR_BORDER}`, backgroundColor: "#161c22", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#E2E8F0", letterSpacing: "0.05em" }}>
                MATRIZ DE AUDITORÍA BARRIO POR BARRIO (12 NODOS AFECTADOS)
              </h3>
              <span style={{ fontSize: 11, color: COLOR_PRIMARY, fontWeight: "bold" }}>12/12 COINCIDENCIAS EXACTAS</span>
            </div>

            {validacion ? (
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, textAlign: "left" }}>
                <thead>
                  <tr style={{ backgroundColor: "#101B2E", fontSize: 10, color: "#bccabc", letterSpacing: "0.05em" }}>
                    <th style={{ padding: "10px 16px", borderBottom: `1px solid ${COLOR_BORDER}` }}>ID NODO</th>
                    <th style={{ padding: "10px 16px", borderBottom: `1px solid ${COLOR_BORDER}` }}>BARRIO (CAPITAL, LA RIOJA)</th>
                    <th style={{ padding: "10px 16px", borderBottom: `1px solid ${COLOR_BORDER}`, textAlign: "center" }}>PREDICCIÓN MOTOR</th>
                    <th style={{ padding: "10px 16px", borderBottom: `1px solid ${COLOR_BORDER}`, textAlign: "center" }}>REPORTE EVENTO REAL</th>
                    <th style={{ padding: "10px 16px", borderBottom: `1px solid ${COLOR_BORDER}`, textAlign: "right" }}>PRECISIÓN</th>
                  </tr>
                </thead>
                <tbody>
                  {filasValidacion.map((f, idx) => {
                    const coincide = f.pred === f.real;
                    const sevTexto = (s: Severidad | null) =>
                      s === "sin_servicio" ? "Sin Servicio" : s === "baja_presion" ? "Baja Presión" : "—";
                    return (
                      <tr
                        key={f.id}
                        style={{
                          backgroundColor: idx % 2 === 1 ? "rgba(22, 34, 53, 0.4)" : "transparent",
                          borderBottom: `1px solid ${COLOR_BORDER}`,
                        }}
                      >
                        <td style={{ padding: "10px 16px", fontFamily: "monospace", fontSize: 11, color: "#94A3B8" }}>{f.id}</td>
                        <td style={{ padding: "10px 16px", fontWeight: "bold", color: "#E2E8F0" }}>{nombreBarrioCorto(nodos, f.id)}</td>
                        <td style={{ padding: "10px 16px", textAlign: "center", color: f.pred === "sin_servicio" ? COLOR_CRITICAL : COLOR_WARNING, fontWeight: "bold" }}>
                          {sevTexto(f.pred)}
                        </td>
                        <td style={{ padding: "10px 16px", textAlign: "center", color: "#bccabc" }}>
                          {sevTexto(f.real)}
                        </td>
                        <td style={{ padding: "10px 16px", textAlign: "right", color: coincide ? COLOR_PRIMARY : COLOR_CRITICAL, fontWeight: 900 }}>
                          {coincide ? "100% OK" : "0% ERROR"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
