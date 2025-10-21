import { PanelFilter, PanelRow, calcularEstado } from '../models/Panel.js';
import { apiClient } from './ApiClient.js';

export class PanelService {
  async list(filter: PanelFilter): Promise<PanelRow[]> {
    // Intentar filtrar desde el backend con query params; si no, filtrar client-side
    const params = new URLSearchParams();
    params.set('planta', filter.planta);
    if (filter.paciente) params.set('paciente', filter.paciente);
    if (filter.fecha) params.set('fecha', filter.fecha);
    if (filter.estado) params.set('estado', filter.estado);

    try {
      const res = await apiClient.get<PanelRow[]>(`/api/panel?${params.toString()}`);
      return this.applyClientFilters(res, filter);
    } catch {
      // Si falla el backend, retornar lista vacía (sin datos simulados)
      return [];
    }
  }

  private applyClientFilters(rows: PanelRow[], filter: PanelFilter): PanelRow[] {
    let out = rows.filter(r => r.planta === filter.planta);
    if (filter.paciente) {
      const q = filter.paciente.toLowerCase();
      out = out.filter(r => r.paciente.toLowerCase().includes(q) || r.id.toLowerCase().includes(q));
    }
    if (filter.fecha) {
      out = out.filter(r => r.fechaExamen === filter.fecha);
    }
    if (filter.estado) {
      out = out.filter(r => calcularEstado(r.fechaExamen) === filter.estado);
    }
    return out;
  }
}
