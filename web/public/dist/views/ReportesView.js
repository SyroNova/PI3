export class ReportesView {
    constructor() {
        Object.defineProperty(this, "tbody", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "msgBox", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "graficoPlaceholder", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "ctxSodio", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "ctxPotasio", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "ctxCloro", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "charts", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "lastRows", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        this.tbody = document.getElementById('reportes-tbody');
        this.msgBox = document.getElementById('reportes-msg');
        this.graficoPlaceholder = document.getElementById('grafico-placeholder');
        this.ensureChartsCanvas();
        // Re-renderizar al cambiar tema para aplicar colores correctos
        window.addEventListener('themechange', () => {
            if (this.lastRows && this.lastRows.length) {
                this.renderCharts(this.lastRows);
            }
        });
    }
    onFilterChange(handler) {
        const inputs = [
            document.getElementById('filtro-paciente'),
            document.getElementById('filtro-fecha-inicio'),
            document.getElementById('filtro-fecha-fin'),
            document.getElementById('filtro-planta'),
        ];
        inputs.forEach((el) => el?.addEventListener('change', handler));
        document.getElementById('export-pdf')?.addEventListener('click', () => handler());
        document.getElementById('export-excel')?.addEventListener('click', () => handler());
    }
    getFilters() {
        const get = (id) => document.getElementById(id)?.value || '';
        return {
            paciente: get('filtro-paciente') || undefined,
            fechaInicio: get('filtro-fecha-inicio') || undefined,
            fechaFin: get('filtro-fecha-fin') || undefined,
            planta: get('filtro-planta') || undefined,
        };
    }
    setLoading(loading) {
        if (this.msgBox) {
            this.msgBox.textContent = loading ? 'Cargando…' : '';
            this.msgBox.style.color = '#64748b';
        }
    }
    showError(message) {
        if (this.msgBox) {
            this.msgBox.textContent = message;
            this.msgBox.style.color = '#b91c1c';
        }
    }
    renderTable(rows) {
        if (!this.tbody)
            return;
        this.tbody.innerHTML = '';
        if (!rows.length) {
            if (this.msgBox) {
                this.msgBox.textContent = 'Sin datos para los filtros seleccionados.';
                this.msgBox.style.color = '#64748b';
            }
            return;
        }
        const fmt = (v) => (v === undefined || v === null || v === '' ? '—' : String(v));
        const frag = document.createDocumentFragment();
        rows.forEach((r) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
        <td>${fmt(r.paciente)}</td>
        <td>${new Date(r.examDate).toLocaleDateString('es-ES')}</td>
        <td>${fmt(r.planta)}</td>
        <td>${fmt(r.sodio)}</td>
        <td>${fmt(r.potasio)}</td>
        <td>${fmt(r.cloro)}</td>
        <td>${fmt(r.alertas)}</td>
      `;
            frag.appendChild(tr);
        });
        this.tbody.appendChild(frag);
    }
    renderCharts(rows) {
        // Lazy: Chart.js se expone como window.Chart por CDN
        const Chart = window.Chart;
        if (!Chart)
            return;
        this.destroyCharts();
        this.lastRows = rows;
        // Si no hay datos, mostrar placeholder y no renderizar gráficos vacíos
        if (!rows || rows.length === 0) {
            if (this.graficoPlaceholder)
                this.graficoPlaceholder.style.display = 'block';
            return;
        }
        const sorted = [...rows].sort((a, b) => +new Date(a.examDate) - +new Date(b.examDate));
        const labels = sorted.map((r) => new Date(r.examDate).toLocaleDateString('es-ES'));
        const dNa = sorted.map((r) => r.sodio ?? null);
        const dK = sorted.map((r) => r.potasio ?? null);
        const dCl = sorted.map((r) => r.cloro ?? null);
        if (this.ctxSodio)
            this.charts.push(new Chart(this.ctxSodio, lineCfg('Sodio (Na+)', labels, dNa, '#2563eb')));
        if (this.ctxPotasio)
            this.charts.push(new Chart(this.ctxPotasio, lineCfg('Potasio (K+)', labels, dK, '#22c55e')));
        if (this.ctxCloro)
            this.charts.push(new Chart(this.ctxCloro, lineCfg('Cloro (Cl−)', labels, dCl, '#f59e0b')));
        if (this.graficoPlaceholder)
            this.graficoPlaceholder.style.display = rows.length ? 'none' : 'block';
    }
    ensureChartsCanvas() {
        const container = document.getElementById('reportes-graficos');
        if (!container)
            return;
        if (document.getElementById('chart-sodio'))
            return; // ya existen
        const wrap = document.createElement('div');
        wrap.className = 'charts-grid';
        wrap.innerHTML = `
      <div class="chart-item"><canvas id="chart-sodio"></canvas></div>
      <div class="chart-item"><canvas id="chart-potasio"></canvas></div>
      <div class="chart-item"><canvas id="chart-cloro"></canvas></div>
    `;
        container.appendChild(wrap);
        this.ctxSodio = document.getElementById('chart-sodio')?.getContext('2d');
        this.ctxPotasio = document.getElementById('chart-potasio')?.getContext('2d');
        this.ctxCloro = document.getElementById('chart-cloro')?.getContext('2d');
    }
    destroyCharts() {
        this.charts.forEach((c) => c?.destroy?.());
        this.charts = [];
    }
}
function lineCfg(label, labels, data, color) {
    // Obtener colores desde variables CSS para respetar el tema actual
    const css = getComputedStyle(document.documentElement);
    const textColor = css.getPropertyValue('--text').trim() || '#1e293b';
    const gridColor = css.getPropertyValue('--border').trim() || 'rgba(148,163,184,.35)';
    return {
        type: 'line',
        data: {
            labels,
            datasets: [
                {
                    label,
                    data,
                    borderColor: color,
                    backgroundColor: color + '33',
                    tension: 0.25,
                    spanGaps: true,
                    pointRadius: 3,
                    pointHoverRadius: 4,
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: true, labels: { color: textColor } },
            },
            scales: {
                x: {
                    ticks: { color: textColor },
                    grid: { color: gridColor },
                },
                y: {
                    ticks: { color: textColor },
                    grid: { color: gridColor },
                },
            },
        },
    };
}
