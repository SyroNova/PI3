import { Metric } from '../models/Dashboard.js';

export class DashboardView {
  welcome = document.getElementById('welcome') as HTMLHeadingElement;
  role = document.getElementById('role') as HTMLParagraphElement;
  metrics = document.getElementById('metrics') as HTMLDivElement;
  today = document.getElementById('today') as HTMLParagraphElement;
  time = document.getElementById('time') as HTMLSpanElement;

  setWelcome(name: string){ this.welcome.textContent = `Bienvenido , ${name}`; }
  setRole(role: string){ this.role.innerHTML = role; }

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
      <div class="metric-card" style="border-color:${m.borderColor}; ${m.fill ? `background:${m.fill}`:''}">
        <div class="metric-icon" style="color:${m.borderColor}">${m.value}</div>
        <h2 class="metric-value"></h2>
        <div class="metric-label">${m.label}</div>
      </div>
    `).join('');
  }

  onPrimaryActions({onNew, onSearch, onAlerts}:{onNew:()=>void; onSearch:()=>void; onAlerts:()=>void;}){
    (document.getElementById('act-new') as HTMLButtonElement).addEventListener('click', onNew);
    (document.getElementById('act-search') as HTMLButtonElement).addEventListener('click', onSearch);
    (document.getElementById('act-alerts') as HTMLButtonElement).addEventListener('click', onAlerts);
  }
}


