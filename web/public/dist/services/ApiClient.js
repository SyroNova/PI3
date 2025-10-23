export class ApiClient {
    constructor() {
        Object.defineProperty(this, "host", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'https://pi3-production.up.railway.app'
        });
    }
    authHeaders() {
        const h = { 'Content-Type': 'application/json', 'Accept': 'application/json' };
        const token = localStorage.getItem('authToken');
        if (token)
            h['Authorization'] = `Bearer ${token}`;
        return h;
    }
    async get(path) {
        const res = await fetch(this.host + path, { headers: this.authHeaders() });
        if (!res.ok)
            throw new Error(`${res.status} ${res.statusText}`);
        return (await res.json());
    }
    async post(path, body) {
        const res = await fetch(this.host + path, {
            method: 'POST',
            headers: this.authHeaders(),
            body: body !== undefined ? JSON.stringify(body) : undefined,
        });
        if (!res.ok)
            throw new Error(`${res.status} ${res.statusText}`);
        return (await res.json());
    }
    async put(path, body) {
        const res = await fetch(this.host + path, {
            method: 'PUT',
            headers: this.authHeaders(),
            body: body !== undefined ? JSON.stringify(body) : undefined,
        });
        if (!res.ok)
            throw new Error(`${res.status} ${res.statusText}`);
        return (await res.json());
    }
    async delete(path) {
        const res = await fetch(this.host + path, {
            method: 'DELETE',
            headers: this.authHeaders(),
        });
        if (!res.ok)
            throw new Error(`${res.status} ${res.statusText}`);
        return (await res.json());
    }
}
export const apiClient = new ApiClient();
