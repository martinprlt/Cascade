import { describe, expect, it } from "vitest";
import { cargarDatosCascade, redBase } from "../lib/grafo";
import { simularEscenario } from "../lib/escenarios";
import { rankingAlternativas } from "../lib/ranking";
import { validarContraEventoReal } from "../lib/validacion";
import { calcularMetricas } from "../lib/metricas";

const datos = cargarDatosCascade();

function severidades(escenarioId: string) {
  const r = simularEscenario(datos, escenarioId);
  const sin = Object.entries(r.severidadPorBarrio)
    .filter(([, s]) => s === "sin_servicio")
    .map(([id]) => id)
    .sort();
  const baja = Object.entries(r.severidadPorBarrio)
    .filter(([, s]) => s === "baja_presion")
    .map(([id]) => id)
    .sort();
  return { sin, baja, metricas: r.metricas };
}

describe("Motor de propagacion - escenario de validacion (esc-01, evento real dic-2024)", () => {
  it("reproduce el evento real de la perforacion Av. Los Cactus: 3 sin servicio, 9 con baja presion", () => {
    const { sin, baja } = severidades("esc-01");
    expect(sin).toEqual(["barrio-las-talas-alta", "barrio-nk-alta", "barrio-procrear"]);
    expect(baja).toEqual([
      "barrio-circunvalacion",
      "barrio-coop-santa-rosa",
      "barrio-el-mirador",
      "barrio-emp-telecom",
      "barrio-luis-vernet",
      "barrio-nueva-esperanza",
      "barrio-rivadavia",
      "barrio-san-cayetano",
      "barrio-susana-quintela",
    ]);
  });

  it("computa metricas identicas a las esperadas (fixture calibrado contra el evento real)", () => {
    const { metricas } = severidades("esc-01");
    expect(metricas.usuariosSinServicio).toBe(2900);
    expect(metricas.usuariosBajaPresion).toBe(8600);
    expect(metricas.deficitM3).toBe(2880);
    expect(metricas.viajesCamion).toBe(240);
    expect(metricas.costoMitigacionARS).toBe(60000000);
    expect(metricas.camionesRequeridos).toBe(15);
  });

  it("obtiene recall 1.0 contra el evento real reportado", () => {
    const v = validarContraEventoReal(datos, "esc-01");
    expect(v.recallSinServicio).toBe(1.0);
    expect(v.recallBajaPresion).toBe(1.0);
    expect(v.recallPromedio).toBe(1.0);
    expect(datos.escenarios.find((e) => e.id === "esc-01")?.validacion?.recallEsperado).toBe(1.0);
  });

  it("la severidad emerge de la topologia: el recall no depende de valores cargados a mano", () => {
    const v = validarContraEventoReal(datos, "esc-01");
    for (const id of v.prediccion.sin_servicio) {
      expect(v.esperado.sin_servicio).toContain(id);
    }
    for (const id of v.prediccion.baja_presion) {
      expect(v.esperado.baja_presion).toContain(id);
    }
  });
});

describe("Motor de propagacion - escenarios operativos", () => {
  it("esc-02: falla parcial Sanagasta + cierre ramal alto -> San Nicolas y Don Bosco sin servicio; Centro y sector Este con baja presion", () => {
    const { sin, baja, metricas } = severidades("esc-02");
    expect(sin).toEqual(["barrio-don-bosco", "barrio-san-nicolas"]);
    expect(baja).toEqual(["barrio-centro", "barrio-centro-comercial", "barrio-la-rodadera", "barrio-yacampis"]);
    expect(metricas.deficitM3).toBe(2400);
    expect(metricas.costoMitigacionARS).toBe(50000000);
    expect(metricas.camionesRequeridos).toBe(13);
  });

  it("esc-03: cierre valvula sector Este -> los 3 barrios del este sin servicio", () => {
    const { sin } = severidades("esc-03");
    expect(sin).toEqual(["barrio-centro-comercial", "barrio-la-rodadera", "barrio-yacampis"]);
  });

  it("esc-04: falla perforacion Las Talas -> 9 barrios con baja presion, ninguno sin servicio", () => {
    const { sin, baja } = severidades("esc-04");
    expect(sin).toEqual([]);
    expect(baja).toHaveLength(9);
  });
});

describe("Ranking de alternativas (esc-05)", () => {
  it("ordena las maniobras por costo de mitigacion ascendente", () => {
    const ranking = rankingAlternativas(datos, "esc-05");
    const costos = ranking.map((m) => m.metricas.costoMitigacionARS);
    expect(costos).toEqual([...costos].sort((a, b) => a - b));
  });

  it("la maniobra combinada gana y 'sin maniobra' es la peor", () => {
    const ranking = rankingAlternativas(datos, "esc-05");
    expect(ranking[0].maniobraId).toBe("man-05");
    expect(ranking[ranking.length - 1].maniobraId).toBe("man-01");
    expect(ranking[0].metricas.costoMitigacionARS).toBeLessThan(ranking[ranking.length - 1].metricas.costoMitigacionARS);
  });

  it("sin maniobra reproduce el costo esperado del fixture (81M, 3880 m3, 21 camiones)", () => {
    const ranking = rankingAlternativas(datos, "esc-05");
    const sinManiobra = ranking.find((m) => m.maniobraId === "man-01");
    expect(sinManiobra?.metricas.deficitM3).toBe(3880);
    expect(sinManiobra?.metricas.costoMitigacionARS).toBe(81000000);
    expect(sinManiobra?.metricas.camionesRequeridos).toBe(21);
  });

  it("cada costo de maniobra es consistente con la formula viajes x precio", () => {
    const ranking = rankingAlternativas(datos, "esc-05");
    for (const m of ranking) {
      const esperadoViajes = Math.ceil(m.metricas.deficitM3 / datos.supuestos.capacidadCisternaM3);
      expect(m.metricas.viajesCamion).toBe(esperadoViajes);
      expect(m.metricas.costoMitigacionARS).toBe(esperadoViajes * datos.supuestos.costoViajeCamionAguateroARS);
    }
  });

  it("el ranking del motor reproduce exactamente el fixture resultadoEsperado del JSON", () => {
    const ranking = rankingAlternativas(datos, "esc-05");
    const esperado = datos.escenarios.find((e) => e.id === "esc-05")?.ranking?.resultadoEsperado ?? [];
    expect(ranking.map((m) => m.maniobraId)).toEqual(esperado.map((e) => e.id));
    for (let i = 0; i < ranking.length; i++) {
      expect(ranking[i].metricas.deficitM3).toBe(esperado[i].deficitM3);
      expect(ranking[i].metricas.costoMitigacionARS).toBe(esperado[i].costoMitigacionARS);
      expect(ranking[i].metricas.camionesRequeridos).toBe(esperado[i].camionesRequeridos);
    }
  });
});

describe("Propiedades del motor", () => {
  it("es determinista: dos corridas del mismo escenario dan resultados identicos (excepto duracionMs)", () => {
    const a = simularEscenario(datos, "esc-01");
    const b = simularEscenario(datos, "esc-01");
    expect(a.escenarioId).toBe(b.escenarioId);
    expect(a.severidadPorBarrio).toEqual(b.severidadPorBarrio);
    expect(a.metricas).toEqual(b.metricas);
    expect(a.explicacion).toBe(b.explicacion);
  });

  it("rechaza duracion de falla invalida (0 o negativa)", () => {
    const red = redBase(datos);
    const severidad = { "barrio-procrear": "sin_servicio" as const };
    expect(() => calcularMetricas(red, severidad, datos.supuestos, 0)).toThrow(/positivo/);
    expect(() => calcularMetricas(red, severidad, datos.supuestos, -48)).toThrow(/positivo/);
  });

  it("funciona sin I/O: recibe el grafo y devuelve resultados puros", () => {
    expect(typeof datos.nodos.length).toBe("number");
    expect(datos.nodos.length).toBeGreaterThan(40);
  });
});
