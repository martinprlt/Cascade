import { NextResponse } from "next/server";
import { cargarDatosCascade } from "../../../lib/grafo";
import { simularEscenario } from "../../../lib/escenarios";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const escenarioId = String(body?.escenarioId ?? "");
    const duracionHoras = Number(body?.duracionHoras ?? 48);

    if (!escenarioId) {
      return NextResponse.json({ error: "Falta escenarioId" }, { status: 400 });
    }
    if (!Number.isFinite(duracionHoras) || duracionHoras <= 0) {
      return NextResponse.json({ error: `duracionHoras invalida: ${body?.duracionHoras}` }, { status: 400 });
    }

    const datos = cargarDatosCascade();
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
