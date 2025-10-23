import { AlertLevel, Metric, PatientItem } from '../models/Dashboard.js';
import { apiClient } from './ApiClient.js';

export class DashboardService {
  async getName(): Promise<string> {
    try {
      const data = await apiClient.get<{ name: string }>('/api/dashboard/me');
      return data.name;
    } catch {
      return 'Usuario';
    }
  }
  async getRole(): Promise<string> {
    try {
      const data = await apiClient.get<{ role: string }>('/api/dashboard/me');
      return data.role || '';
    } catch {
      return '';
    }
  }
  async getMetrics(): Promise<Metric[]> {
    try {
      const data = await apiClient.get<Array<{ label: string; value: number }>>('/api/dashboard/metrics');
      return data.map(m => ({ label: m.label, value: m.value, borderColor: '#0A4173' }));
    } catch {
      return [];
    }
  }
  async getRecentPatients(): Promise<PatientItem[]> {
    try {
      const data = await apiClient.get<Array<{ name: string; lastAnalysisAgo: string; level: string; alertText: string }>>('/api/dashboard/recent-patients');
      const toLevel = (v: string): AlertLevel => (v === 'normal' || v === 'warning' || v === 'critical') ? v : 'normal';
      return data.map(p => ({ ...p, level: toLevel(p.level) }));
    } catch {
      return [];
    }
  }
}

