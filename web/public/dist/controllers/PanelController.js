import { PanelService } from '../services/PanelService.js';
import { PanelView } from '../views/PanelView.js';
export class PanelController {
    constructor() {
        Object.defineProperty(this, "svc", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new PanelService()
        });
        Object.defineProperty(this, "view", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new PanelView()
        });
        this.view.bindTabs(() => this.refresh());
        this.view.bindFilters(() => this.refresh());
    }
    async refresh() {
        const filter = this.view.readFilter();
        const rows = await this.svc.list(filter);
        this.view.render(rows);
    }
}
