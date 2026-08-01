import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CASCADE — Motor de Simulación y Propagación de Impacto",
  description:
    "Motor de simulación y propagación de impacto para infraestructuras críticas. Caso de estudio: red de agua de La Rioja (Aguas Riojanas).",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body style={{ margin: 0, backgroundColor: "#0B1220", color: "#E2E8F0", fontFamily: "'Inter', sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
