export type Planta = 'uci' | 'urgencias' | 'hospitalizacion';
export type Estado = 'activo' | 'vencido';

export interface PanelRow {
  id: string;
  paciente: string;
  fechaExamen: string; // ISO yyyy-mm-dd
  planta: Planta;
  na?: number; // sodio
  k?: number;  // potasio
  cl?: number; // cloro
  alertas?: string[];
}

export interface PanelFilter {
  planta: Planta;
  paciente?: string;
  fecha?: string; // yyyy-mm-dd
  estado?: Estado | '';
}

export function calcularEstado(fechaExamen: string): Estado {
  const d = new Date(fechaExamen);
  const diff = Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24));
  return diff <= 2 ? 'activo' : 'vencido';
}
