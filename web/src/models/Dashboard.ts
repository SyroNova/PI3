export type AlertLevel = 'normal' | 'warning' | 'critical';

export interface Metric {
  label: string;
  value: number;
  borderColor: string; // css color
  fill?: string;       // opcional para resaltar
}

export interface PatientItem {
  name: string;
  lastAnalysisAgo: string;
  level: AlertLevel;
  alertText?: string;
}

export class DashboardModel {
  name = '';
  role = '';
  metrics: Metric[] = [];
  patients: PatientItem[] = [];
}
