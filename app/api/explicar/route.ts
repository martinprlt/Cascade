import { NextResponse } from "next/server";
import { cargarDatosCascade } from "../../../lib/grafo";
import { explicarResultado } from "../../../lib/explicador";
import { duracionFalla } from "../../../lib/escenarios";
import type { DatosCascade, ResultadoSimulacion } from "../../../lib/types";

export const dynamic = "force-dynamic";

const TIMEOUT_MS = 2500;
const MODELO_LLM = "gpt-4o-mini";

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
  const escenario = datos.escenarios.find((e) => e.id === escenarioId);
  if (!escenario) throw new Error(`Escenario inexistente: ${escenarioId}`);
  const nombreDeNodo = (id: string) => datos.nodos.find((n) => n.id === id)?.nombre ?? id;
  return explicarResultado(
    escenario,
    resultado.severidadPorBarrio,
    resultado.metricas,
    nombreDeNodo,
    duracionFalla(datos, duracionHoras)
  );
}

function construirPrompt(escenarioId: string, resultado: ResultadoSimulacion, duracionHoras: number): string {
  const porSeveridad = (sev: string) =>
    Object.entries(resultado.severidadPorBarrio)
      .filter(([, s]) => s === sev)
      .map(([id]) => id);
  const sinServicio = porSeveridad("sin_servicio");
  const bajaPresion = porSeveridad("baja_presion");
  const m = resultado.metricas;
  return [
    `Escenario: ${escenarioId} (${resultado.escenarioNombre}).`,
    `Barrios sin servicio (${m.usuariosSinServicio} usuarios): ${sinServicio.join(", ") || "ninguno"}.`,
    `Barrios con baja presion (${m.usuariosBajaPresion} usuarios): ${bajaPresion.join(", ") || "ninguno"}.`,
    `Duracion: ${duracionHoras} h. Deficit estimado: ${m.deficitM3} m3. Camiones requeridos: ${m.camionesRequeridos}. Costo de mitigacion: $ ${m.costoMitigacionARS.toLocaleString("es-AR")}.`,
    "Explica en 3 a 5 oraciones en espanol rioplatense, sin inventar datos: que fallo, que barrios se ven afectados y como se mitiga.",
  ].join("\n");
}

async function explicacionLLM(escenarioId: string, resultado: ResultadoSimulacion, duracionHoras: number): Promise<string> {
  const controlador = new AbortController();
  const temporizador = setTimeout(() => controlador.abort(), TIMEOUT_MS);
  try {
    const respuesta = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      signal: controlador.signal,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: MODELO_LLM,
        temperature: 0.3,
        messages: [
          {
            role: "system",
            content:
              "Sos el explicador de CASCADE, un simulador determinista de fallas en la red de agua de La Rioja. Tu unica tarea es redactar en lenguaje natural el resultado que se te pasa; jamas inventes datos, barrios ni numeros.",
          },
          { role: "user", content: construirPrompt(escenarioId, resultado, duracionHoras) },
        ],
      }),
    });
    if (!respuesta.ok) throw new Error(`LLM HTTP ${respuesta.status}`);
    const json = (await respuesta.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const texto = json.choices?.[0]?.message?.content?.trim();
    if (!texto) throw new Error("LLM devolvio contenido vacio");
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
    if (!datos.escenarios.some((e) => e.id === validado.escenarioId)) {
      return NextResponse.json({ error: `Escenario inexistente: ${validado.escenarioId}` }, { status: 404 });
    }

    if (process.env.OPENAI_API_KEY) {
      try {
        const explicacion = await explicacionLLM(validado.escenarioId, validado.resultado, validado.duracionHoras);
        return NextResponse.json({ explicacion, fuente: "ia" as Fuente });
      } catch {
      }
    }

    const explicacion = explicacionDeterministica(datos, validado.escenarioId, validado.resultado, validado.duracionHoras);
    return NextResponse.json({ explicacion, fuente: "deterministico" as Fuente });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
