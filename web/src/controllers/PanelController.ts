import { PanelService } from '../services/PanelService.js';
import { PanelView } from '../views/PanelView.js';

export class PanelController {
  private svc = new PanelService();
  private view = new PanelView();

  constructor() {
    this.view.bindTabs(() => this.refresh());
    this.view.bindFilters(() => this.refresh());
  }

  public async refresh(): Promise<void> {
    const filter = this.view.readFilter();
    const rows = await this.svc.list(filter);
    this.view.render(rows);
  }
}

