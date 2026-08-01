import { describe, expect, it } from "vitest";
import { explicarResultado } from "../lib/explicador";
import type { Escenario, ResultadoMetricas, Severidad } from "../lib/types";

const escenarioMock: Escenario = {
  id: "esc-test",
  nombre: "Falla de Prueba",
  mutaciones: [{ nodo: "nodo-1", accion: "falla" }],
};

const metricasMock: ResultadoMetricas = {
  usuariosSinServicio: 1000,
  usuariosBajaPresion: 2000,
  deficitM3: 500,
  viajesCamion: 42,
  costoMitigacionARS: 10500000,
  camionesRequeridos: 3,
  severidadAgregada: 0.5,
  usuariosTotales: 5000,
};

describe("Explicador Determinista (lib/explicador.ts)", () => {
  it("genera la explicación correcta cuando hay barrios sin servicio y con baja presión", () => {
    const severidad: Record<string, Severidad> = {
      b1: "sin_servicio",
      b2: "baja_presion",
      b3: "normal",
    };
    const nombreNodo = (id: string) => (id === "b1" ? "Barrio Uno" : id === "b2" ? "Barrio Dos" : "Barrio Tres");

    const resultado = explicarResultado(escenarioMock, severidad, metricasMock, nombreNodo, 48);

    expect(resultado).toContain("Escenario: Falla de Prueba.");
    expect(resultado).toContain("1 barrio sin servicio: Barrio Uno (1000 usuarios).");
    expect(resultado).toContain("1 barrio con baja presión: Barrio Dos (2000 usuarios).");
    expect(resultado).toContain("Déficit estimado: 500 m³ en 48 h. Mitigación: 42 viajes de camión aguatero (3 camiones), costo estimado $ 10.500.000.");
  });

  it("maneja plurales correctamente para múltiples barrios sin servicio", () => {
    const severidad: Record<string, Severidad> = {
      b1: "sin_servicio",
      b2: "sin_servicio",
    };
    const nombreNodo = (id: string) => id;

    const resultado = explicarResultado(escenarioMock, severidad, metricasMock, nombreNodo, 24);

    expect(resultado).toContain("2 barrios sin servicio: b1, b2");
  });

  it("emite mensaje cuando ningún barrio resulta afectado", () => {
    const severidad: Record<string, Severidad> = {
      b1: "normal",
    };

    const resultado = explicarResultado(escenarioMock, severidad, { ...metricasMock, usuariosSinServicio: 0, usuariosBajaPresion: 0 }, (id) => id, 12);

    expect(resultado).toContain("Ningún barrio resulta afectado.");
  });
});
