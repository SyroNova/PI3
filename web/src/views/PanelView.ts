import type { PanelFilter, PanelRow, Planta } from '../models/Panel.js';
import { calcularEstado } from '../models/Panel.js';

export class PanelView {
  private tbody: HTMLElement;
  private msg: HTMLElement | null;
  private currentPlanta: Planta = 'uci';

  constructor() {
    const tb = document.getElementById('panel-tbody');
    if (!tb) throw new Error('panel-tbody no encontrado');
    this.tbody = tb;
    this.msg = document.getElementById('panel-msg');
  }

  bindTabs(onChange: (planta: Planta) => void): void {
    document.querySelectorAll<HTMLButtonElement>('.panel-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.panel-tab').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentPlanta = (btn.dataset.planta as Planta) || 'uci';
        onChange(this.currentPlanta);
      });
    });
    // Activar uno por defecto (UCI)
    const first = document.querySelector<HTMLButtonElement>('.panel-tab[data-planta="uci"]');
    first?.classList.add('active');
  }

  readFilter(): PanelFilter {
    const paciente = (document.getElementById('filtro-paciente') as HTMLInputElement | null)?.value.trim();
    const fecha = (document.getElementById('filtro-fecha') as HTMLInputElement | null)?.value || undefined;
    const estado = (document.getElementById('filtro-estado') as HTMLSelectElement | null)?.value as any;
    return { planta: this.currentPlanta, paciente, fecha, estado };
  }

  bindFilters(onChange: () => void): void {
    ['filtro-paciente','filtro-fecha','filtro-estado'].forEach(id => {
      const el = document.getElementById(id);
      el?.addEventListener('input', onChange);
      el?.addEventListener('change', onChange);
    });
  }

  render(rows: PanelRow[]): void {
    this.tbody.innerHTML = '';
    if (this.msg) this.msg.style.display = rows.length ? 'none' : 'block';
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

function fmt(n?: number): string { return typeof n === 'number' ? '' : `${console.log(typeof n)}`; }
function title(s: string): string { return s.charAt(0).toUpperCase() + s.slice(1); }
function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit' });
}
