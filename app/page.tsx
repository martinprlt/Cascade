"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import NetworkView from "../components/NetworkView";
import type {
  Arista,
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

const FONDO = "#0B1220";
const TARJETA = "#101B2E";
const BORDE = "#1E293B";
const TEXTO = "#E2E8F0";
const TEXTO_SUAVE = "#94A3B8";
const ROJO = "var(--color-sin-servicio, #D92D20)";
const NARANJA = "var(--color-baja-presion, #F79009)";
const VERDE = "var(--color-normal, #12B76A)";

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
    tono === "rojo" ? "#F87171" : tono === "verde" ? "#4ADE80" : TEXTO;
  return (
    <div
      style={{
        background: TARJETA,
        border: `1px solid ${BORDE}`,
        borderRadius: 12,
        padding: "14px 20px 16px",
        flex: 1,
      }}
    >
      <div style={{ fontSize: 13, color: TEXTO_SUAVE, textTransform: "uppercase", letterSpacing: 1 }}>
        {label}
      </div>
      <div style={{ fontSize: 64, fontWeight: 700, color, lineHeight: 1.15, marginTop: 4, whiteSpace: "nowrap" }}>
        {valor}
        {sufijo && <span style={{ fontSize: 28, marginLeft: 6 }}>{sufijo}</span>}
      </div>
      {sub && <div style={{ fontSize: 13, color: "#64748B", marginTop: 6 }}>{sub}</div>}
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
  const [resultado, setResultado] = useState<ResultadoSimulacion | null>(null);
  const [ranking, setRanking] = useState<RespuestaRanking | null>(null);
  const [explicacion, setExplicacion] = useState<Explicacion | null>(null);
  const [validacion, setValidacion] = useState<ResultadoValidacion | null>(null);
  const [cargando, setCargando] = useState(false);
  const [explicando, setExplicando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const simular = useCallback(async (escenarioId: string) => {
    setCargando(true);
    setError(null);
    setSeleccionado(escenarioId);
    setExplicacion(null);
    try {
      const resSimular = await fetch("/api/simular", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ escenarioId }),
      });
      if (!resSimular.ok) throw new Error(`Error al simular: HTTP ${resSimular.status}`);
      const r = (await resSimular.json()) as ResultadoSimulacion;
      setResultado(r);

      setRanking(null);
      const resRanking = await fetch("/api/ranking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ escenarioId }),
      });
      if (resRanking.ok) setRanking((await resRanking.json()) as RespuestaRanking);

      setExplicando(true);
      try {
        const resExplicar = await fetch("/api/explicar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ escenarioId, resultado: r }),
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
  }, []);

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
    void simular("esc-01");
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

  const mejorManiobra = ranking?.resultados?.[0] ?? null;
  const sinManiobra = ranking?.resultados?.find((m) => m.maniobraId === "man-01") ?? null;
  const ahorro =
    mejorManiobra && sinManiobra && sinManiobra.metricas.costoMitigacionARS > mejorManiobra.metricas.costoMitigacionARS
      ? sinManiobra.metricas.costoMitigacionARS - mejorManiobra.metricas.costoMitigacionARS
      : null;
  const ahorroPct =
    ahorro && sinManiobra ? Math.round((ahorro / sinManiobra.metricas.costoMitigacionARS) * 100) : null;

  const m = resultado?.metricas;
  const textoExplicacion = explicacion?.texto ?? resultado?.explicacion ?? "Seleccioná un escenario para generar la explicación.";
  const totalEsperado =
    validacion ? validacion.esperado.sin_servicio.length + validacion.esperado.baja_presion.length : 0;

  return (
    <div style={{ minHeight: "100vh", background: FONDO, color: TEXTO, padding: 20, fontFamily: "Inter, system-ui, sans-serif" }}>
      <header style={{ display: "flex", alignItems: "baseline", gap: 16, padding: "4px 8px 16px", borderBottom: `1px solid ${BORDE}` }}>
        <h1 style={{ margin: 0, fontSize: 32, fontWeight: 800, letterSpacing: 1 }}>CASCADE</h1>
        <span style={{ color: TEXTO_SUAVE, fontSize: 14 }}>Pulso Riojano · motor de propagación de impacto</span>
        {resultado && (
          <span style={{ marginLeft: "auto", color: TEXTO_SUAVE, fontSize: 13 }}>
            propagación en {formatoNumero(Number(resultado.duracionMs.toFixed(2)))} ms
          </span>
        )}
      </header>

      {error && (
        <div style={{ marginTop: 12, background: "#3B0D0D", border: `1px solid ${ROJO}`, borderRadius: 10, padding: "10px 14px", color: "#FECACA", fontSize: 14 }}>
          {error}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "360px 1fr", gap: 16, marginTop: 16, alignItems: "start" }}>
        <aside style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ background: TARJETA, border: `1px solid ${BORDE}`, borderRadius: 12, padding: 16 }}>
            <h2 style={{ margin: "0 0 12px", fontSize: 14, letterSpacing: 2, color: TEXTO_SUAVE }}>ESCENARIOS</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {escenarios.map((e) => {
                const activo = e.id === seleccionado;
                return (
                  <button
                    key={e.id}
                    type="button"
                    onClick={() => void simular(e.id)}
                    disabled={cargando}
                    style={{
                      display: "flex",
                      gap: 10,
                      alignItems: "center",
                      textAlign: "left",
                      background: activo ? "#1E293B" : "transparent",
                      border: `1px solid ${activo ? "#334155" : BORDE}`,
                      borderRadius: 8,
                      padding: "10px 12px",
                      color: TEXTO,
                      cursor: cargando ? "wait" : "pointer",
                      fontSize: 14,
                      fontFamily: "inherit",
                    }}
                  >
                    <span
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: 6,
                        flexShrink: 0,
                        background: activo ? NARANJA : "transparent",
                        border: `2px solid ${activo ? NARANJA : TEXTO_SUAVE}`,
                      }}
                    />
                    <span>{e.nombre}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {resultado && (
            <div style={{ background: TARJETA, border: `1px solid ${BORDE}`, borderRadius: 12, padding: 16 }}>
              <div style={{ fontSize: 12, color: TEXTO_SUAVE, letterSpacing: 1 }}>RESULTADO · {resultado.escenarioNombre}</div>
              <div style={{ fontSize: 22, fontWeight: 700, marginTop: 6, color: TEXTO }}>
                <span style={{ color: ROJO }}>{conteos.sin}</span> sin servicio ·{" "}
                <span style={{ color: NARANJA }}>{conteos.baja}</span> baja presión
              </div>
              <div style={{ fontSize: 13, color: TEXTO_SUAVE, marginTop: 4 }}>
                {conteos.normal} barrios normales · {resultado.metricas.usuariosTotales.toLocaleString("es-AR")} usuarios modelados
              </div>
            </div>
          )}

          {ranking && mejorManiobra && (
            <div
              style={{
                background: "#0F2A1E",
                border: `1px solid ${VERDE}`,
                borderRadius: 12,
                padding: 16,
              }}
            >
              <div style={{ fontSize: 12, color: TEXTO_SUAVE, letterSpacing: 1 }}>MEJOR MANIOBRA · RANKING</div>
              <div style={{ fontSize: 16, fontWeight: 700, marginTop: 8, color: "#4ADE80" }}>{mejorManiobra.nombre}</div>
              <div style={{ fontSize: 26, fontWeight: 800, marginTop: 6, color: TEXTO }}>
                ${formatoNumero(mejorManiobra.metricas.costoMitigacionARS)}
                <span style={{ fontSize: 16, color: TEXTO_SUAVE, fontWeight: 400 }}>
                  {" "}· {formatoNumero(mejorManiobra.metricas.camionesRequeridos)} camiones
                </span>
              </div>
              {ahorro !== null && ahorroPct !== null && (
                <div style={{ fontSize: 13, color: VERDE, marginTop: 6 }}>
                  Ahorra ${formatoNumero(ahorro)} ({ahorroPct}%) vs no hacer nada (${formatoNumero(sinManiobra!.metricas.costoMitigacionARS)})
                </div>
              )}
              {ranking.criterio && <div style={{ fontSize: 12, color: TEXTO_SUAVE, marginTop: 8 }}>{ranking.criterio}</div>}
            </div>
          )}
        </aside>

        <main style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
          <section
            style={{
              position: "relative",
              background: TARJETA,
              border: `1px solid ${BORDE}`,
              borderRadius: 12,
              padding: 12,
            }}
          >
            <NetworkView nodos={nodos} aristas={aristas} severidad={resultado?.severidadPorBarrio} etiquetas />
            {cargando && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "rgba(11,18,32,0.65)",
                  borderRadius: 12,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 16,
                  color: TEXTO,
                }}
              >
                Simulando propagación…
              </div>
            )}
            <div style={{ display: "flex", gap: 24, alignItems: "center", padding: "10px 6px 0", fontSize: 13, color: TEXTO_SUAVE, flexWrap: "wrap" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 12, height: 12, borderRadius: 6, background: ROJO }} />
                sin servicio ({conteos.sin})
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 12, height: 12, borderRadius: 6, background: NARANJA }} />
                baja presión ({conteos.baja})
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 12, height: 12, borderRadius: 6, background: VERDE }} />
                normal ({conteos.normal})
              </span>
              <span style={{ marginLeft: "auto" }}>
                red: {nodos.length} nodos · {aristas.length} aristas
              </span>
            </div>
          </section>

          <section style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {resultado && m ? (
              <>
                <div style={{ display: "flex", gap: 12 }}>
                  <TarjetaMetrica
                    label="Usuarios sin servicio"
                    valor={formatoNumero(m.usuariosSinServicio)}
                    tono={m.usuariosSinServicio > 0 ? "rojo" : "verde"}
                    sub={`de ${formatoNumero(m.usuariosTotales)} usuarios modelados`}
                  />
                  <TarjetaMetrica label="Déficit de agua" valor={formatoNumero(m.deficitM3)} sufijo="m³" sub="estimado a 48 h" />
                  <TarjetaMetrica
                    label="Camiones requeridos"
                    valor={formatoNumero(m.camionesRequeridos)}
                    sub="el evento real usó 15"
                  />
                </div>
                <TarjetaMetrica
                  label="Costo de mitigación"
                  valor={`$${formatoNumero(m.costoMitigacionARS)}`}
                  tono="rojo"
                  sub={`${formatoNumero(m.viajesCamion)} viajes de camión aguatero`}
                />
              </>
            ) : (
              <div style={{ display: "flex", gap: 12 }}>
                <TarjetaMetrica label="Usuarios sin servicio" valor="—" />
                <TarjetaMetrica label="Déficit de agua" valor="—" sufijo="m³" />
                <TarjetaMetrica label="Camiones requeridos" valor="—" />
              </div>
            )}
          </section>

          <div style={{ display: "grid", gridTemplateColumns: "1.05fr 1fr", gap: 16, alignItems: "start" }}>
            <section style={{ background: TARJETA, border: `1px solid ${BORDE}`, borderRadius: 12, padding: 16 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <h2 style={{ margin: 0, fontSize: 14, letterSpacing: 2, color: TEXTO_SUAVE }}>EXPLICADOR</h2>
                {explicacion && (
                  <span
                    style={{
                      fontSize: 11,
                      letterSpacing: 1,
                      textTransform: "uppercase",
                      color: explicacion.fuente === "ia" ? "#A5B4FC" : TEXTO_SUAVE,
                      background: explicacion.fuente === "ia" ? "rgba(99,102,241,0.15)" : "rgba(148,163,184,0.15)",
                      borderRadius: 999,
                      padding: "3px 10px",
                    }}
                  >
                    {explicacion.fuente === "ia" ? "IA" : "determinístico"}
                  </span>
                )}
              </div>
              {explicando ? (
                <p style={{ fontSize: 16, lineHeight: 1.6, margin: 0, color: TEXTO_SUAVE }}>Calculando explicación…</p>
              ) : (
                <p style={{ fontSize: 16, lineHeight: 1.6, margin: 0, color: TEXTO }}>{textoExplicacion}</p>
              )}
            </section>

            <section style={{ background: TARJETA, border: `1px solid ${BORDE}`, borderRadius: 12, padding: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, gap: 12 }}>
                <div>
                  <div style={{ fontSize: 12, color: TEXTO_SUAVE, letterSpacing: 1 }}>VALIDACIÓN · ESC-01 VS DIC-2024</div>
                  <div style={{ fontSize: 18, fontWeight: 700, marginTop: 4 }}>Predicción vs realidad</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 40, fontWeight: 800, lineHeight: 1, color: VERDE }}>
                    {validacion ? `${totalEsperado}/${totalEsperado}` : "—"}
                  </div>
                  <div style={{ fontSize: 12, color: TEXTO_SUAVE }}>
                    recall {validacion ? formatoNumero(Number(validacion.recallPromedio.toFixed(2))) : "…"}
                  </div>
                </div>
              </div>
              {validacion ? (
                <>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                    <thead>
                      <tr style={{ color: TEXTO_SUAVE }}>
                        <th align="left" style={{ padding: "4px 6px", fontWeight: 600 }}>Barrio</th>
                        <th style={{ padding: "4px 6px", fontWeight: 600 }}>Predicción</th>
                        <th style={{ padding: "4px 6px", fontWeight: 600 }}>Realidad</th>
                        <th style={{ padding: "4px 6px", fontWeight: 600 }}>✓</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filasValidacion.map((f) => {
                        const coincide = f.pred === f.real;
                        const sevTexto = (s: Severidad | null) =>
                          s === "sin_servicio" ? "sin servicio" : s === "baja_presion" ? "baja presión" : "—";
                        return (
                          <tr key={f.id} style={{ borderTop: `1px solid ${BORDE}` }}>
                            <td style={{ padding: "6px", color: TEXTO }}>{nombreBarrioCorto(nodos, f.id)}</td>
                            <td align="center" style={{ padding: "6px", color: f.pred === "sin_servicio" ? "#F87171" : f.pred === "baja_presion" ? "#FBBF24" : TEXTO_SUAVE }}>
                              {sevTexto(f.pred)}
                            </td>
                            <td align="center" style={{ padding: "6px", color: TEXTO_SUAVE }}>{sevTexto(f.real)}</td>
                            <td align="center" style={{ padding: "6px", color: coincide ? VERDE : "#F87171" }}>{coincide ? "✓" : "✗"}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  <div style={{ fontSize: 12, color: TEXTO_SUAVE, marginTop: 10 }}>
                    sin servicio {validacion.prediccion.sin_servicio.length}/{validacion.esperado.sin_servicio.length} · baja presión{" "}
                    {validacion.prediccion.baja_presion.length}/{validacion.esperado.baja_presion.length} · fuente: Nueva Rioja 17/12/2024
                  </div>
                </>
              ) : (
                <p style={{ fontSize: 14, color: TEXTO_SUAVE, margin: 0 }}>Cargando validación…</p>
              )}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
