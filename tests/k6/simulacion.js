import http from "k6/http";
import { check } from "k6";

export const options = {
  stages: [
    { duration: "5s", target: 1 },
    { duration: "5s", target: 50 },
    { duration: "30s", target: 50 },
    { duration: "5s", target: 0 },
  ],
  thresholds: {
    http_req_duration: ["p(95)<100"],
    http_req_failed: ["rate<0.01"],
  },
};

const ESCENARIOS = ["esc-01", "esc-02", "esc-03", "esc-04", "esc-05"];
const BASE_URL = __ENV.CASCADE_URL || "http://localhost:3000";

export default function () {
  const escenarioId = ESCENARIOS[Math.floor(Math.random() * ESCENARIOS.length)];
  const res = http.post(
    `${BASE_URL}/api/simular`,
    JSON.stringify({ escenarioId }),
    { headers: { "Content-Type": "application/json" } }
  );
  check(res, {
    "status 200": (r) => r.status === 200,
    "tiene metricas": (r) => JSON.parse(r.body).metricas !== undefined,
  });
}
