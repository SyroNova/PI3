export class DashboardView {
    constructor() {
        Object.defineProperty(this, "welcome", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: document.getElementById('welcome')
        });
        Object.defineProperty(this, "role", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: document.getElementById('role')
        });
        Object.defineProperty(this, "metrics", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: document.getElementById('metrics')
        });
        Object.defineProperty(this, "today", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: document.getElementById('today')
        });
        Object.defineProperty(this, "time", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: document.getElementById('time')
        });
        Object.defineProperty(this, "recentList", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: document.getElementById('recent-list')
        });
        Object.defineProperty(this, "alertsSub", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: document.getElementById('alerts-sub')
        });
    }
    setWelcome(name) { this.welcome.textContent = `Bienvenido , ${name}`; }
    setRole(role) { this.role.textContent = role; }
    setDate(date) {
        const fmt = new Intl.DateTimeFormat('es', { weekday: 'long', day: 'numeric', month: 'long' });
        const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
        this.today.textContent = cap(fmt.format(date));
    }
    setTime(date) {
        const t = new Intl.DateTimeFormat('es', { hour: '2-digit', minute: '2-digit', hour12: false }).format(date);
        this.time.textContent = t;
    }
    renderMetrics(items) {
        this.metrics.innerHTML = items.map(m => `
      <article class="metric ${m.fill ? 'metric--accent' : ''}" style="border-color:${m.borderColor}; ${m.fill ? `background:${m.fill}` : ''}">
        <div class="metric__value" style="color:${m.borderColor}">${m.value}</div>
        <div class="metric__label">${m.label}</div>
      </article>
    `).join('');
        const pending = items.find(i => i.label.toLowerCase().includes('alerta'))?.value ?? 0;
        if (this.alertsSub)
            this.alertsSub.textContent = `${pending} alertas pendientes`;
    }
    renderRecents(items) {
        this.recentList.innerHTML = items.map(p => `
      <div class="rec">
        <div>
          <p class="rec__name">${p.name}</p>
          <p class="rec__meta">Último análisis: ${p.lastAnalysisAgo}</p>
        </div>
        <div class="status ${p.level === 'normal' ? 'status--ok' : p.level === 'warning' ? 'status--warn' : 'status--crit'}">
          ${p.alertText ?? (p.level === 'normal' ? 'Normal' : '')}
        </div>
      </div>
    `).join('');
    }
    onPrimaryActions({ onNew, onSearch, onAlerts }) {
        document.getElementById('act-new').addEventListener('click', onNew);
        document.getElementById('act-search').addEventListener('click', onSearch);
        document.getElementById('act-alerts').addEventListener('click', onAlerts);
    }
}
