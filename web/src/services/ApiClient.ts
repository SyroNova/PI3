export class ApiClient {
  private baseUrl: string;

  constructor() {
    // Configurable via localStorage to point to your backend, e.g. http://localhost:3000
    const stored = localStorage.getItem('apiBaseUrl');
    if (stored) {
      this.baseUrl = stored;
    } else {
      // Heuristic: if running on vite dev (port 5173), default backend to 3000
      const isDev = typeof window !== 'undefined' && /^(127\.0\.0\.1|localhost)$/i.test(window.location.hostname) && (window.location.port === '5173' || window.location.port === '5500');
      if (isDev) {
        const host = window.location.hostname; // use same hostname to avoid cross-name issues
        this.baseUrl = `http://${host}:3000`;
      } else {
        this.baseUrl = '';
      }
      if (this.baseUrl) {
        console.info('[ApiClient] Using default dev API baseUrl:', this.baseUrl);
      }
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
