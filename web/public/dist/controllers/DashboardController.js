import { DashboardModel } from '../models/Dashboard.js';
import { DashboardView } from '../views/DashboardView.js';
import { DashboardService } from '../services/DashboardService.js';
export class DashboardController {
    constructor() {
        Object.defineProperty(this, "model", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new DashboardModel()
        });
        Object.defineProperty(this, "view", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new DashboardView()
        });
        Object.defineProperty(this, "service", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new DashboardService()
        });
        Object.defineProperty(this, "clock", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.init();
    }
    async init() {
        // Carga datos
        const [name, role, metrics, patients] = await Promise.all([
            this.service.getName(),
            this.service.getRole(),
            this.service.getMetrics(),
            this.service.getRecentPatients(),
        ]);
        this.model.name = name;
        this.model.role = role;
        this.model.metrics = metrics;
        this.model.patients = patients;
        // Render
        this.view.setWelcome(this.model.name);
        this.view.setRole(this.model.role);
        this.view.setDate(new Date());
        this.view.renderMetrics(this.model.metrics);
        this.view.renderRecents(this.model.patients);
        // Reloj
        this.tick();
        this.clock = window.setInterval(() => this.tick(), 1000);
        // Acciones (aquí pon la navegación real)
        this.view.onPrimaryActions({
            onNew: () => alert('Ir a “Ingresar Paciente”'),
            onSearch: () => alert('Ir a “Consultar Paciente”'),
            onAlerts: () => alert('Ir al “Panel de Alertas”'),
        });
    }
    tick() {
        const now = new Date();
        this.view.setTime(now);
        this.view.setDate(now); // si quieres que el día cambie a medianoche
    }
    destroy() { if (this.clock)
        window.clearInterval(this.clock); }
}
