export class ApiClient {
    constructor() {
        Object.defineProperty(this, "baseUrl", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        // Configurable via localStorage to point to your backend, e.g. http://localhost:3000
        const stored = localStorage.getItem('apiBaseUrl');
        if (stored) {
            this.baseUrl = stored;
        }
        else {
            // Heuristic: if running on vite dev (port 5173), default backend to 3000
            const isDev = typeof window !== 'undefined' && /^(127\.0\.0\.1|localhost)$/i.test(window.location.hostname) && (window.location.port === '5173' || window.location.port === '5500');
            if (isDev) {
                const host = window.location.hostname; // use same hostname to avoid cross-name issues
                this.baseUrl = `http://${host}:3000`;
            }
            else {
                this.baseUrl = '';
            }
            if (this.baseUrl) {
                console.info('[ApiClient] Using default dev API baseUrl:', this.baseUrl);
            }
        }
    }
    setBaseUrl(url) {
        this.baseUrl = url;
        localStorage.setItem('apiBaseUrl', url);
    }
    makeUrl(path) {
        if (/^https?:\/\//i.test(path))
            return path;
        let base = (this.baseUrl || '').replace(/\/$/, '');
        // Fallback safety: if base is not set and we're on a dev port, assume localhost:3000
        if (!base && typeof window !== 'undefined') {
            const devPorts = new Set(['5173', '5500']);
            if (devPorts.has(window.location.port)) {
                base = 'http://localhost:3000';
            }
            // Allow global override if provided
            const anyWin = window;
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
    authHeaders() {
        const h = { 'Content-Type': 'application/json', 'Accept': 'application/json' };
        const token = localStorage.getItem('authToken');
        if (token)
            h['Authorization'] = `Bearer ${token}`;
        return h;
    }
    async get(path) {
        const res = await fetch(this.makeUrl(path), { headers: this.authHeaders() });
        if (!res.ok)
            throw new Error(`${res.status} ${res.statusText}`);
        return (await res.json());
    }
    async post(path, body) {
        const res = await fetch(this.makeUrl(path), {
            method: 'POST',
            headers: this.authHeaders(),
            body: body !== undefined ? JSON.stringify(body) : undefined,
        });
        if (!res.ok)
            throw new Error(`${res.status} ${res.statusText}`);
        return (await res.json());
    }
    async put(path, body) {
        const res = await fetch(this.makeUrl(path), {
            method: 'PUT',
            headers: this.authHeaders(),
            body: body !== undefined ? JSON.stringify(body) : undefined,
        });
        if (!res.ok)
            throw new Error(`${res.status} ${res.statusText}`);
        return (await res.json());
    }
    async delete(path) {
        const res = await fetch(this.makeUrl(path), {
            method: 'DELETE',
            headers: this.authHeaders(),
        });
        if (!res.ok)
            throw new Error(`${res.status} ${res.statusText}`);
        return (await res.json());
    }
}
export const apiClient = new ApiClient();
