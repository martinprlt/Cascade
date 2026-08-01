export default function Home() {
  return (
    <main style={{ padding: 48, maxWidth: 800, margin: "0 auto" }}>
      <h1>CASCADE</h1>
      <p>
        Motor de Simulación y Propagación de Impacto para Infraestructuras Críticas — caso de estudio: red de agua de La
        Rioja.
      </p>
      <p>Frontend del dashboard: se maqueta con v0 (ver docs/03-mvp-scope.md). La API del motor ya está disponible:</p>
      <ul>
        <li>POST /api/simular — simula un escenario pre-horneado</li>
        <li>POST /api/ranking — rankea maniobras de mitigación</li>
        <li>GET /api/validacion — tabla de validación contra dic-2024</li>
        <li>GET /api/red — la red modelada como grafo</li>
      </ul>
    </main>
  );
}
