import { NextResponse } from "next/server";
import { cargarDatosCascade } from "../../../lib/grafo";

export const dynamic = "force-dynamic";

export async function GET() {
  const datos = cargarDatosCascade();
  return NextResponse.json({
    nodos: datos.nodos,
    aristas: datos.aristas,
    escenarios: datos.escenarios.map((e) => ({ id: e.id, nombre: e.nombre, descripcion: e.descripcion })),
    supuestos: datos.supuestos,
    fuentes: datos.fuentes,
  });
}
