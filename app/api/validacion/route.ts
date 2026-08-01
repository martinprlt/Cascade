import { NextResponse } from "next/server";
import { cargarDatosCascade } from "../../../lib/grafo";
import { validarContraEventoReal } from "../../../lib/validacion";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const datos = cargarDatosCascade();
    const resultado = validarContraEventoReal(datos, "esc-01");
    return NextResponse.json(resultado);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
