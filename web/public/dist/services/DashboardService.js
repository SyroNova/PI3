import { apiClient } from './ApiClient.js';
export class DashboardService {
    async getName() {
        try {
            const data = await apiClient.get('/api/me');
            return data.name;
        }
        catch {
            return 'Usuario';
        }
    }
    async getRole() {
        try {
            const data = await apiClient.get('/api/me');
            return data.role || '';
        }
        catch {
            return '';
        }
    }
    async getMetrics() {
        try {
            const data = await apiClient.get('/api/dashboard/metrics');
            return data.map(m => ({ label: m.label, value: m.value, borderColor: '#0A4173' }));
        }
        catch {
            return [];
        }
    }
    async getRecentPatients() {
        try {
            const data = await apiClient.get('/api/dashboard/recent-patients');
            const toLevel = (v) => (v === 'normal' || v === 'warning' || v === 'critical') ? v : 'normal';
            return data.map(p => ({ ...p, level: toLevel(p.level) }));
        }
        catch {
            return [];
        }
    }
}
