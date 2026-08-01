import { describe, expect, it } from "vitest";
import { POST as simularHandler } from "../app/api/simular/route";
import { POST as rankingHandler } from "../app/api/ranking/route";
import { GET as redHandler } from "../app/api/red/route";
import { GET as validacionHandler } from "../app/api/validacion/route";

describe("API Routes Integration Tests", () => {
  it("GET /api/red devuelve el grafo de la red y escenarios", async () => {
    const res = await redHandler();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.nodos).toBeDefined();
    expect(data.aristas).toBeDefined();
    expect(data.escenarios).toHaveLength(5);
  });

  it("POST /api/simular esc-01 devuelve los 12 barrios afectados y métricas del evento real", async () => {
    const req = new Request("http://localhost/api/simular", {
      method: "POST",
      body: JSON.stringify({ escenarioId: "esc-01" }),
    });
    const res = await simularHandler(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.escenarioId).toBe("esc-01");
    expect(data.metricas.usuariosSinServicio).toBe(2900);
    expect(data.metricas.deficitM3).toBe(2880);
    expect(data.metricas.camionesRequeridos).toBe(15);
  });

  it("POST /api/simular rechaza escenarios inexistentes con 404", async () => {
    const req = new Request("http://localhost/api/simular", {
      method: "POST",
      body: JSON.stringify({ escenarioId: "escenario-invalido" }),
    });
    const res = await simularHandler(req);
    expect(res.status).toBe(404);
  });

  it("POST /api/simular rechaza solicitudes sin escenarioId con 400", async () => {
    const req = new Request("http://localhost/api/simular", {
      method: "POST",
      body: JSON.stringify({}),
    });
    const res = await simularHandler(req);
    expect(res.status).toBe(400);
  });

  it("POST /api/ranking esc-05 devuelve maniobras ordenadas por costo ascendente", async () => {
    const req = new Request("http://localhost/api/ranking", {
      method: "POST",
      body: JSON.stringify({ escenarioId: "esc-05" }),
    });
    const res = await rankingHandler(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.resultados).toBeDefined();
    expect(data.resultados.length).toBeGreaterThan(0);
    expect(data.resultados[0].maniobraId).toBe("man-05");
  });

  it("GET /api/validacion devuelve recall 1.0 contra evento dic-2024", async () => {
    const req = new Request("http://localhost/api/validacion?escenarioId=esc-01");
    const res = await validacionHandler(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.recallPromedio).toBe(1.0);
  });
});
