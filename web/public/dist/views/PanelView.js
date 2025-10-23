import { calcularEstado } from '../models/Panel.js';
export class PanelView {
    constructor() {
        Object.defineProperty(this, "tbody", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "msg", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "currentPlanta", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'uci'
        });
        const tb = document.getElementById('panel-tbody');
        if (!tb)
            throw new Error('panel-tbody no encontrado');
        this.tbody = tb;
        this.msg = document.getElementById('panel-msg');
    }
    bindTabs(onChange) {
        document.querySelectorAll('.panel-tab').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.panel-tab').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentPlanta = btn.dataset.planta || 'uci';
                onChange(this.currentPlanta);
            });
        });
        // Activar uno por defecto (UCI)
        const first = document.querySelector('.panel-tab[data-planta="uci"]');
        first?.classList.add('active');
    }
    readFilter() {
        const paciente = document.getElementById('filtro-paciente')?.value.trim();
        const fecha = document.getElementById('filtro-fecha')?.value || undefined;
        const estado = document.getElementById('filtro-estado')?.value;
        return { planta: this.currentPlanta, paciente, fecha, estado };
    }
    bindFilters(onChange) {
        ['filtro-paciente', 'filtro-fecha', 'filtro-estado'].forEach(id => {
            const el = document.getElementById(id);
            el?.addEventListener('input', onChange);
            el?.addEventListener('change', onChange);
        });
    }
    render(rows) {
        this.tbody.innerHTML = '';
        if (this.msg)
            this.msg.style.display = rows.length ? 'none' : 'block';
        for (const r of rows) {
            const tr = document.createElement('tr');
            tr.classList.add(calcularEstado(r.fechaExamen));
            tr.innerHTML = `
        <td>${r.paciente}</td>
        <td>${formatDate(r.fechaExamen)}</td>
        <td>${title(calcularEstado(r.fechaExamen))}</td>
        <td>${r.na}</td>
        <td>${r.k}</td>
        <td>${r.cl}</td>
        <td>${(r.alertas?.join(', ') || '—')}</td>
        <td><a href="consultarPaciente.html?id=${encodeURIComponent(r.id)}">Ver</a></td>
      `;
            this.tbody.appendChild(tr);
        }
    }
}
function fmt(n) { return typeof n === 'number' ? '' : `${console.log(typeof n)}`; }
function title(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
function formatDate(iso) {
    const d = new Date(iso);
    return d.toLocaleDateString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit' });
}
