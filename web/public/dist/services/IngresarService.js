import { apiClient } from './ApiClient.js';
/**
 * Service responsible for sending patient registration to backend.
 */
export class IngresarService {
    async register(patient) {
        try {
            const data = await apiClient.post('/api/patients', patient);
            return { ok: true, id: data.id };
        }
        catch (err) {
            return { ok: false, error: err.message };
        }
    }
}
