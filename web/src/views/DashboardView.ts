import { Metric, PatientItem } from '../models/Dashboard.js';

export class DashboardView {
  welcome = document.getElementById('welcome') as HTMLHeadingElement;
  role = document.getElementById('role') as HTMLParagraphElement;
  metrics = document.getElementById('metrics') as HTMLDivElement;
  today = document.getElementById('today') as HTMLParagraphElement;
  time = document.getElementById('time') as HTMLSpanElement;
  recentList = document.getElementById('recent-list') as HTMLDivElement;
  alertsSub = document.getElementById('alerts-sub') as HTMLSpanElement;

  setWelcome(name: string){ this.welcome.textContent = `Bienvenido , ${name}`; }
  setRole(role: string){ this.role.textContent = role; }

  setDate(date: Date){
    const fmt = new Intl.DateTimeFormat('es', { weekday:'long', day:'numeric', month:'long' });
    const cap = (s:string) => s.charAt(0).toUpperCase() + s.slice(1);
    this.today.textContent = cap(fmt.format(date));
  }
  setTime(date: Date){
    const t = new Intl.DateTimeFormat('es', { hour:'2-digit', minute:'2-digit', hour12:false }).format(date);
    this.time.textContent = t;
  }

  renderMetrics(items: Metric[]){
    this.metrics.innerHTML = items.map(m => `
      <article class="metric ${m.fill ? 'metric--accent' : ''}" style="border-color:${m.borderColor}; ${m.fill ? `background:${m.fill}`:''}">
        <div class="metric__value" style="color:${m.borderColor}">${m.value}</div>
        <div class="metric__label">${m.label}</div>
      </article>
    `).join('');
    const pending = items.find(i => i.label.toLowerCase().includes('alerta'))?.value ?? 0;
    if (this.alertsSub) this.alertsSub.textContent = `${pending} alertas pendientes`;
  }

  renderRecents(items: PatientItem[]){
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

  onPrimaryActions({onNew, onSearch, onAlerts}:{onNew:()=>void; onSearch:()=>void; onAlerts:()=>void;}){
    (document.getElementById('act-new') as HTMLButtonElement).addEventListener('click', onNew);
    (document.getElementById('act-search') as HTMLButtonElement).addEventListener('click', onSearch);
    (document.getElementById('act-alerts') as HTMLButtonElement).addEventListener('click', onAlerts);
  }
}
