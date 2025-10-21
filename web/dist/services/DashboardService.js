export class DashboardService {
    async getName() {
        await new Promise(r => setTimeout(r, 120));
        return 'Dr Alex';
    }
    async getRole() {
        await new Promise(r => setTimeout(r, 80));
        return 'Jefe de UCI - Hospital central';
    }
    async getMetrics() {
        await new Promise(r => setTimeout(r, 160));
        return [
            { label: 'Pacientes Activos', value: 23, borderColor: '#0A4173' },
            { label: 'Alertas Pendientes', value: 5, borderColor: '#FFA000' },
            { label: 'Análisis Hoy', value: 23, borderColor: '#23A55B', fill: '#eaf7f0' },
            { label: 'Egresos', value: 23, borderColor: '#0A4173' },
        ];
    }
    async getRecentPatients() {
        await new Promise(r => setTimeout(r, 180));
        return [
            { name: 'Juan Nicolas Rey', lastAnalysisAgo: 'Hace 2 horas', level: 'critical', alertText: 'Sodio Elevado' },
            { name: 'Juan Nicolas Rey', lastAnalysisAgo: 'Hace 3 horas', level: 'normal', alertText: 'Normal' },
        ];
    }
}
