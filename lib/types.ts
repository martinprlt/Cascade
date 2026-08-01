export type TipoNodo = "perforacion" | "tanque" | "valvula" | "bomba" | "barrio" | "acueducto";
export type EstadoNodo = "activo" | "fallado" | "cerrado" | "reducido";
export type EstadoArista = "abierta" | "cerrada";
export type Severidad = "sin_servicio" | "baja_presion" | "normal";

export interface Nodo {
  id: string;
  nombre: string;
  tipo: TipoNodo;
  zona: string;
  usuarios?: number;
  m3Dia?: number;
  caudalHorarioM3?: number;
  estado: EstadoNodo;
  subTipo?: string;
  descripcion?: string;
  supuesto?: boolean;
  fuente?: string;
  estadoReportadoDic2024?: Severidad;
  /** false: nodo de paso (p.ej. acueducto alimentado por valvula) que no genera agua */
  esFuente?: boolean;
}

export interface Arista {
  from: string;
  to: string;
  dirigida: boolean;
  etiqueta?: string;
  estado: EstadoArista;
  capacidad?: number;
  viaValvula?: string;
}

export interface RedDeAgua {
  nodos: Nodo[];
  aristas: Arista[];
}

export interface SupuestosMetricas {
  consumoLitrosPerCapitaDia: number;
  costoViajeCamionAguateroARS: number;
  capacidadCisternaM3: number;
  viajesPorCamionDia: number;
  factorSeveridadBajaPresion: number;
  duracionFallaHoras?: number;
  camionesIniciales?: number;
  camionesRefuerzo?: number;
}

export interface Mutacion {
  nodo: string;
  accion: "falla" | "cierre" | "apertura" | "reduccion";
  caudalHorarioM3?: number;
}

export interface CandidatoManiobra {
  id: string;
  nombre: string;
  mutaciones: Mutacion[];
}

export interface Escenario {
  id: string;
  nombre: string;
  descripcion?: string;
  mutaciones: Mutacion[];
  eventoReal?: {
    fuente?: string;
    reporte?: string;
  };
  validacion?: {
    estadoEsperado?: {
      sin_servicio: string[];
      baja_presion: string[];
    };
    duracionReportadaHoras?: number;
    metricasEsperadas?: ResultadoMetricas;
    recallEsperado?: number;
  };
  ranking?: {
    candidatos: CandidatoManiobra[];
    criterio?: string;
    resultadoEsperado?: Array<{ id: string; costoMitigacionARS: number; deficitM3: number; camionesRequeridos: number }>;
  };
}

export interface DatosCascade {
  meta?: Record<string, unknown>;
  nodos: Nodo[];
  aristas: Arista[];
  escenarios: Escenario[];
  supuestos: SupuestosMetricas;
  fuentes?: Array<{ ref: string; nombre: string; url: string; fecha?: string }>;
}

export interface ResultadoMetricas {
  usuariosSinServicio: number;
  usuariosBajaPresion: number;
  deficitM3: number;
  viajesCamion: number;
  costoMitigacionARS: number;
  camionesRequeridos: number;
  severidadAgregada: number;
  usuariosTotales: number;
}

export interface ResultadoSimulacion {
  escenarioId: string;
  escenarioNombre: string;
  severidadPorBarrio: Record<string, Severidad>;
  nodosEstado?: Record<string, EstadoNodo>;
  metricas: ResultadoMetricas;
  explicacion: string;
  duracionMs: number;
}

export interface ResultadoManiobra {
  maniobraId: string;
  nombre: string;
  severidadPorBarrio: Record<string, Severidad>;
  metricas: ResultadoMetricas;
}

export interface ResultadoValidacion {
  escenarioId: string;
  prediccion: { sin_servicio: string[]; baja_presion: string[] };
  esperado: { sin_servicio: string[]; baja_presion: string[] };
  recallSinServicio: number;
  recallBajaPresion: number;
  recallPromedio: number;
  metricas: ResultadoMetricas;
}
