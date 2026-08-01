import { NextResponse } from "next/server";
import { cargarDatosCascade } from "../../../lib/grafo";
import { explicarResultado } from "../../../lib/explicador";
import { duracionFalla } from "../../../lib/escenarios";
import { rankingAlternativas } from "../../../lib/ranking";
import type { DatosCascade, ResultadoSimulacion } from "../../../lib/types";

export const dynamic = "force-dynamic";

const TIMEOUT_MS = 4000;
const MODELO_GROQ = "llama-3.3-70b-versatile";
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

type Fuente = "deterministico" | "ia";

interface Cuerpo {
  escenarioId?: unknown;
  resultado?: unknown;
  duracionHoras?: unknown;
}

interface Validado {
  escenarioId: string;
  resultado: ResultadoSimulacion;
  duracionHoras: number;
}

function validarCuerpo(cuerpo: Cuerpo): Validado | null {
  if (typeof cuerpo.escenarioId !== "string" || cuerpo.escenarioId === "") return null;
  const resultado = cuerpo.resultado as ResultadoSimulacion | undefined;
  if (
    !resultado ||
    typeof resultado !== "object" ||
    typeof resultado.severidadPorBarrio !== "object" ||
    resultado.severidadPorBarrio === null ||
    typeof resultado.metricas !== "object" ||
    resultado.metricas === null
  ) {
    return null;
  }
  const duracionHoras = Number(cuerpo.duracionHoras ?? 48);
  if (!Number.isFinite(duracionHoras) || duracionHoras <= 0) return null;
  return { escenarioId: cuerpo.escenarioId, resultado, duracionHoras };
}

function explicacionDeterministica(
  datos: DatosCascade,
  escenarioId: string,
  resultado: ResultadoSimulacion,
  duracionHoras: number
): string {
  const escenario = datos.escenarios.find((e) => e.id === escenarioId) ?? {
    id: "custom",
    nombre: resultado.escenarioNombre || "Escenario Personalizado",
    descripcion: "Escenario dinámico generado en tiempo real",
    mutaciones: [],
  };
  const nombreDeNodo = (id: string) => datos.nodos.find((n) => n.id === id)?.nombre ?? id;
  return explicarResultado(
    escenario,
    resultado.severidadPorBarrio,
    resultado.metricas,
    nombreDeNodo,
    duracionFalla(datos, duracionHoras)
  );
}

function construirPrompt(datos: DatosCascade, escenarioId: string, resultado: ResultadoSimulacion, duracionHoras: number): string {
  const nombreDeNodo = (id: string) => datos.nodos.find((n) => n.id === id)?.nombre ?? id;
  const porSeveridad = (sev: string) =>
    Object.entries(resultado.severidadPorBarrio)
      .filter(([, s]) => s === sev)
      .map(([id]) => nombreDeNodo(id));

  const sinServicio = porSeveridad("sin_servicio");
  const bajaPresion = porSeveridad("baja_presion");
  const m = resultado.metricas;

  let recomendacionExacta = "";
  try {
    const r = rankingAlternativas(datos, escenarioId, duracionHoras);
    if (r && r.length > 0) {
      const mejor = r[0];
      recomendacionExacta = `Maniobra óptima calculada por algoritmo: "${mejor.nombre}" (Costo mitigado: $${mejor.metricas.costoMitigacionARS.toLocaleString("es-AR")}, Camiones: ${mejor.metricas.camionesRequeridos}).`;
    }
  } catch {
    recomendacionExacta = "Maniobra óptima: Maniobrar válvulas de sectorización para derivar caudal y desplegar flota de camiones de refuerzo.";
  }

  return [
    `Escenario Simulado: ${escenarioId} (${resultado.escenarioNombre}).`,
    `Barrios sin servicio (${m.usuariosSinServicio} usuarios): ${sinServicio.join(", ") || "ninguno"}.`,
    `Barrios con baja presion (${m.usuariosBajaPresion} usuarios): ${bajaPresion.join(", ") || "ninguno"}.`,
    `Horizonte Temporal: ${duracionHoras} h. Deficit estimado: ${m.deficitM3} m3. Camiones requeridos: ${m.camionesRequeridos}. Costo estimado: $ ${m.costoMitigacionARS.toLocaleString("es-AR")}.`,
    `Solución Calculada por Motor: ${recomendacionExacta}`,
    "REGLAS OBLIGATORIAS PARA LA RESPUESTA:",
    "1. NOMBRES REALES: Usa siempre los nombres reales y legibles de los barrios (ejemplo: 'Barrio Procrear', 'Barrio Néstor Kirchner'). NUNCA uses los IDs técnicos.",
    "2. SOLUCIÓN EXACTA: Basate obligatoriamente en la Maniobra Óptima Calculada arriba. Explica exactamente esa recomendación técnica y por qué soluciona la crisis en lugar de dar sugerencias genéricas.",
    "3. FORMATO: Redacta en 3 a 4 oraciones fluidas en español rioplatense (Diagnóstico -> Afectación -> Solución Recomendada).",
  ].join("\n");
}

async function explicacionLLM(
  datos: DatosCascade,
  escenarioId: string,
  resultado: ResultadoSimulacion,
  duracionHoras: number,
  apiKey: string
): Promise<string> {
  const controlador = new AbortController();
  const temporizador = setTimeout(() => controlador.abort(), TIMEOUT_MS);
  try {
    const respuesta = await fetch(GROQ_API_URL, {
      method: "POST",
      signal: controlador.signal,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODELO_GROQ,
        temperature: 0.15,
        max_tokens: 300,
        messages: [
          {
            role: "system",
            content:
              "Sos el Asistente IA de Inteligencia Operativa de CASCADE (red de agua de La Rioja). Tu función es brindar el diagnóstico técnico y fundamentar la recomendación operativa de solución calculada por el motor algorítmico. Usa nombres reales de barrios y redacta de forma ejecutiva.",
          },
          { role: "user", content: construirPrompt(datos, escenarioId, resultado, duracionHoras) },
        ],
      }),
    });
    if (!respuesta.ok) throw new Error(`Groq LLM HTTP ${respuesta.status}`);
    const json = (await respuesta.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const texto = json.choices?.[0]?.message?.content?.trim();
    if (!texto) throw new Error("Groq LLM devolvió contenido vacío");
    return texto;
  } finally {
    clearTimeout(temporizador);
  }
}

export async function POST(req: Request) {
  try {
    const cuerpo = (await req.json().catch(() => ({}))) as Cuerpo;
    const validado = validarCuerpo(cuerpo);
    if (!validado) {
      return NextResponse.json(
        { error: "Se requiere escenarioId y resultado (ResultadoSimulacion) validos" },
        { status: 400 }
      );
    }

    const datos = cargarDatosCascade();
    if (validado.escenarioId !== "custom" && !datos.escenarios.some((e) => e.id === validado.escenarioId)) {
      return NextResponse.json({ error: `Escenario inexistente: ${validado.escenarioId}` }, { status: 404 });
    }

    const apiKey = process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY;
    if (apiKey) {
      try {
        const explicacion = await explicacionLLM(
          datos,
          validado.escenarioId,
          validado.resultado,
          validado.duracionHoras,
          apiKey
        );
        return NextResponse.json({ explicacion, fuente: "ia" as Fuente, modelo: MODELO_GROQ });
      } catch (err) {
        // Fallback a motor determinístico si la llamada IA falla
      }
    }

    const explicacion = explicacionDeterministica(datos, validado.escenarioId, validado.resultado, validado.duracionHoras);
    return NextResponse.json({ explicacion, fuente: "deterministico" as Fuente });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
