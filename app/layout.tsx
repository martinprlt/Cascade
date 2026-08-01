import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CASCADE — Motor de Simulación y Propagación de Impacto",
  description:
    "Motor de simulación y propagación de impacto para infraestructuras críticas. Caso de estudio: red de agua de La Rioja (Aguas Riojanas).",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body style={{ margin: 0, backgroundColor: "#fafafa", fontFamily: "Inter, system-ui, sans-serif" }}>{children}</body>
    </html>
  );
}
