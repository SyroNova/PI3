import { ReportesService, type ReportFilters } from '../services/ReportesService.js';
import { ReportesView } from '../views/ReportesView.js';

export class ReportesController {
  private service: ReportesService;
  private view: ReportesView;

  constructor() {
    this.service = new ReportesService();
    this.view = new ReportesView();
    this.view.onFilterChange(() => this.load());
    this.load();
  }

  async load(): Promise<void> {
    const filters = this.view.getFilters() as ReportFilters;
    this.view.setLoading(true);
    try {
      const rows = await this.service.fetchElectrolytes(filters);
      this.view.renderTable(rows);
      this.view.renderCharts(rows);
    } catch (err: any) {
      this.view.showError(
        'No fue posible obtener datos del backend. ' + (err?.message ?? '')
      );
      this.view.renderTable([]);
      this.view.renderCharts([]);
    } finally {
      this.view.setLoading(false);
    }
  }
}
