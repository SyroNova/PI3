import type { Patient } from '../models/Patient.js';
import { apiClient } from './ApiClient.js';

/**
 * Service responsible for sending patient registration to backend.
 */
export class IngresarService {
  async register(patient: Patient): Promise<{ ok: boolean; id?: string; error?: string }> {
    try {
      const data = await apiClient.post<{ id: string }>('/api/patients', patient);
      return { ok: true, id: data.id };
    } catch (err) {
      return { ok: false, error: (err as Error).message };
    }
  }
}
