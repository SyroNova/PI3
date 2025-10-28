export type ElectrolyteRecord = {
  id?: string;
  patientId?: string;
  paciente?: string; // nombre completo
  examDate: string; // ISO string
  planta?: string; // UCI, Urgencias, etc
  sodio?: number;
  potasio?: number;
  cloro?: number;
  alertas?: string | number;
};

export type ReportFilters = {
  paciente?: string;
  fechaInicio?: string; // YYYY-MM-DD
  fechaFin?: string; // YYYY-MM-DD
  planta?: string; // uci|urgencias|hospitalizacion (o texto)
};

export type ElectrolyteResponse = ElectrolyteRecord[];

export class ReportesService {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    // Usar misma origin por defecto
    this.baseUrl = baseUrl || 'https://pi3-production.up.railway.app'; // Use || for consistency
  }

  /**
   * Construye URL de consulta para el backend.
   * Espera un endpoint tipo /api/reports/electrolytes con query params.
   */
  private buildUrl(filters: ReportFilters): string {
    const url = new URL('/api/reports/electrolytes', this.baseUrl);
    if (filters.paciente) url.searchParams.set('patient', filters.paciente);
    if (filters.fechaInicio) url.searchParams.set('start', filters.fechaInicio);
    if (filters.fechaFin) url.searchParams.set('end', filters.fechaFin);
    if (filters.planta) url.searchParams.set('planta', filters.planta);
    return url.toString();
  }

  /**
   * Obtiene datos reales del backend. No usa mocks.
   * Si hay error de red o 4xx/5xx, lanza Error para que el controlador lo maneje.
   */
  async fetchElectrolytes(filters: ReportFilters): Promise<ElectrolyteResponse> {
    const url = this.buildUrl(filters);
    const res = await apiClient.get(url)

    if (!res.ok) {
      // Si el server no existe en dev, dará 405/404; propagar para UI
      throw new Error(`Error ${res.status}: ${res.statusText}`);
    }

    const data = (await res.json()) as any[];
    // Normalizar campos posibles
    return (data ?? []).map((row) => {
      const record: ElectrolyteRecord = {
        id: row.id ?? row._id,
        patientId: row.patientId ?? row.pacienteId,
        paciente: row.paciente ?? row.patientName ?? row.nombrePaciente,
        examDate: row.examDate ?? row.fechaExamen ?? row.fecha ?? new Date().toISOString(),
        planta: row.planta ?? row.area ?? row.ubicacion,
        sodio: toNumber(row.sodio ?? row.na ?? row.sodium),
        potasio: toNumber(row.potasio ?? row.k ?? row.potassium),
        cloro: toNumber(row.cloro ?? row.cl ?? row.chloride),
        alertas: row.alertas ?? row.alerts ?? row.flags ?? '',
      };
      return record;
    });
  }
}

function toNumber(v: any): number | undefined {
  const n = typeof v === 'string' ? parseFloat(v) : typeof v === 'number' ? v : NaN;
  return Number.isFinite(n) ? n : undefined;
}


