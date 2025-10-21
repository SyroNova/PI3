import { apiClient } from './ApiClient.js';
export class AuthService {
    async login(username, password) {
        const creds = { username, password };
        try {
            const data = await apiClient.post('/api/auth/login', creds);
            localStorage.setItem('authToken', data.token);
            return { ok: true, token: data.token };
        }
        catch (e) {
            const msg = e.message || '';
            // Fallback: algunos backends exponen /auth/login sin prefijo /api
            if (/\b(404|405)\b/.test(msg)) {
                try {
                    const data2 = await apiClient.post('/auth/login', creds);
                    localStorage.setItem('authToken', data2.token);
                    return { ok: true, token: data2.token };
                }
                catch (e2) {
                    // Intento final: form-urlencoded por si el backend no acepta JSON
                    try {
                        const res = await fetch(window.ELECTROMED_API_BASE ? `${window.ELECTROMED_API_BASE}/auth/login` : '/auth/login', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Accept': 'application/json' },
                            body: new URLSearchParams({ username, password }).toString(),
                        });
                        if (!res.ok) {
                            const txt = await res.text().catch(() => '');
                            return { ok: false, message: `${res.status} ${res.statusText} ${txt}`.trim() };
                        }
                        const data3 = await res.json();
                        if (data3?.token) {
                            localStorage.setItem('authToken', data3.token);
                            return { ok: true, token: data3.token };
                        }
                        return { ok: false, message: 'Respuesta de login inválida' };
                    }
                    catch (e3) {
                        return { ok: false, message: e3.message };
                    }
                }
            }
            return { ok: false, message: msg };
        }
    }
    async requestReset(email) {
        try {
            await apiClient.post('/api/auth/request-reset', { email });
            return { ok: true };
        }
        catch (e) {
            return { ok: false, message: e.message };
        }
    }
    async confirmReset(email, code, newPassword) {
        try {
            await apiClient.post('/api/auth/confirm-reset', { email, code, newPassword });
            return { ok: true };
        }
        catch (e) {
            return { ok: false, message: e.message };
        }
    }
}
