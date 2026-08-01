import { NextResponse } from "next/server";
import { cargarDatosCascade } from "../../../lib/grafo";
import { simularEscenario, simularEscenarioCustom } from "../../../lib/escenarios";
import type { Mutacion } from "../../../lib/types";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const escenarioId = String(body?.escenarioId ?? "");
    const mutaciones = Array.isArray(body?.mutaciones) ? (body.mutaciones as Mutacion[]) : null;
    const duracionHoras = Number(body?.duracionHoras ?? 48);

    if (!Number.isFinite(duracionHoras) || duracionHoras <= 0) {
      return NextResponse.json({ error: `duracionHoras invalida: ${body?.duracionHoras}` }, { status: 400 });
    }

    const datos = cargarDatosCascade();

    if (mutaciones && mutaciones.length > 0) {
      const nombreCustom = body?.nombreCustom ? String(body.nombreCustom) : "Escenario Personalizado";
      const resultado = simularEscenarioCustom(datos, mutaciones, nombreCustom, duracionHoras);
      return NextResponse.json(resultado);
    }

    if (!escenarioId) {
      return NextResponse.json({ error: "Falta escenarioId o mutaciones" }, { status: 400 });
    }

    const disponible = datos.escenarios.some((e) => e.id === escenarioId);
    if (!disponible) {
      return NextResponse.json({ error: `Escenario inexistente: ${escenarioId}` }, { status: 404 });
    }

    const resultado = simularEscenario(datos, escenarioId, duracionHoras);
    return NextResponse.json(resultado);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
