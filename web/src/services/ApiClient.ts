export class ApiClient {
  private readonly host: string = 'https://pi3-production.up.railway.app'

  private authHeaders(): Record<string, string> {
    const h: Record<string, string> = { 'Content-Type': 'application/json', 'Accept': 'application/json' };
    const token = localStorage.getItem('authToken');
    if (token) h['Authorization'] = `Bearer ${token}`;
    return h;
  }

  async get<T = any>(path: string): Promise<T> {
    const res = await fetch(this.host + path, { headers: this.authHeaders() });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    return (await res.json()) as T;
  }

  async post<T = any>(path: string, body?: any): Promise<T> {
    const res = await fetch(this.host + path, {
      method: 'POST',
      headers: this.authHeaders(),
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    return (await res.json()) as T;
  }

  async put<T = any>(path: string, body?: any): Promise<T> {
    const res = await fetch(this.host + path, {
      method: 'PUT',
      headers: this.authHeaders(),
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    return (await res.json()) as T;
  }

  async delete<T = any>(path: string): Promise<T> {
    const res = await fetch(this.host + path, {
      method: 'DELETE',
      headers: this.authHeaders(),
    });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    return (await res.json()) as T;
  }
}

export const apiClient = new ApiClient();

