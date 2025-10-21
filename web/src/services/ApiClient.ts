export class ApiClient {
  private baseUrl: string;
  private readonly host: string = 'pi3-production.up.railway.app'
  
    constructor() {
      // Configurable via localStorage to point to your backend, e.g. http://localhost:3000
      const stored = localStorage.getItem('apiBaseUrl');
      if (stored) {
        this.baseUrl = stored;
      } else {
        
        this.baseUrl = this.host;
        
        
      }
    }


  setBaseUrl(url: string) {
    this.baseUrl = url;
    localStorage.setItem('apiBaseUrl', url);
  }

  private makeUrl(path: string): string {
    if (/^https?:\/\//i.test(path)) return path;
    let base = (this.baseUrl || '').replace(/\/$/, '');
    // Fallback safety: if base is not set and we're on a dev port, assume localhost:3000
    if (!base && typeof window !== 'undefined') {
      const devPorts = new Set(['5173', '5500']);
      if (devPorts.has(window.location.port)) {
        base = 'http://localhost:3000';
      }
      // Allow global override if provided
      const anyWin = window as any;
      if (anyWin.ELECTROMED_API_BASE) {
        base = String(anyWin.ELECTROMED_API_BASE).replace(/\/$/, '');
      }
    }
    const p = path.startsWith('/') ? path : `/${path}`;
    const finalUrl = base ? `${base}${p}` : p; // if base not set, use relative path
    // Dev debug
    if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
      // eslint-disable-next-line no-console
      console.debug('[ApiClient] fetch =>', finalUrl);
    }
    return finalUrl;
  }

  private authHeaders(): Record<string, string> {
    const h: Record<string, string> = { 'Content-Type': 'application/json', 'Accept': 'application/json' };
    const token = localStorage.getItem('authToken');
    if (token) h['Authorization'] = `Bearer ${token}`;
    return h;
  }

  async get<T = any>(path: string): Promise<T> {
    const res = await fetch(this.makeUrl(path), { headers: this.authHeaders() });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    return (await res.json()) as T;
  }

  async post<T = any>(path: string, body?: any): Promise<T> {
    const res = await fetch(this.makeUrl(path), {
      method: 'POST',
      headers: this.authHeaders(),
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    return (await res.json()) as T;
  }

  async put<T = any>(path: string, body?: any): Promise<T> {
    const res = await fetch(this.makeUrl(path), {
      method: 'PUT',
      headers: this.authHeaders(),
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    return (await res.json()) as T;
  }

  async delete<T = any>(path: string): Promise<T> {
    const res = await fetch(this.makeUrl(path), {
      method: 'DELETE',
      headers: this.authHeaders(),
    });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    return (await res.json()) as T;
  }
}

export const apiClient = new ApiClient();
