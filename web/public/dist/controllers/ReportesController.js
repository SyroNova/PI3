import { ReportesService } from '../services/ReportesService.js';
import { ReportesView } from '../views/ReportesView.js';
export class ReportesController {
    constructor() {
        Object.defineProperty(this, "service", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "view", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.service = new ReportesService();
        this.view = new ReportesView();
        this.view.onFilterChange(() => this.load());
        this.load();
    }
    async load() {
        const filters = this.view.getFilters();
        this.view.setLoading(true);
        try {
            const rows = await this.service.fetchElectrolytes(filters);
            this.view.renderTable(rows);
            this.view.renderCharts(rows);
        }
        catch (err) {
            this.view.showError('No fue posible obtener datos del backend. ' + (err?.message ?? ''));
            this.view.renderTable([]);
            this.view.renderCharts([]);
        }
        finally {
            this.view.setLoading(false);
        }
    }
}
