export class AuthService {
    async login(username, password) {
        await new Promise(r => setTimeout(r, 900));
        const valid = username.length >= 3 && password.length >= 6;
        if (!valid)
            return { ok: false, message: 'Usuario o contraseña inválidos.' };
        const token = btoa(`${username}:${Date.now()}`);
        return { ok: true, token };
    }
    async requestReset(email) {
        await new Promise(r => setTimeout(r, 700));
        const mailOk = /^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/.test(email);
        if (!mailOk)
            return { ok: false, message: 'Correo inválido.' };
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        sessionStorage.setItem(`reset:${email}`, code);
        console.info('[AuthService] Código de verificación (demo):', code);
        return { ok: true };
    }
    async confirmReset(email, code, newPassword) {
        await new Promise(r => setTimeout(r, 900));
        const stored = sessionStorage.getItem(`reset:${email}`);
        if (!stored || stored !== code)
            return { ok: false, message: 'Código inválido o expirado.' };
        if (newPassword.length < 8)
            return { ok: false, message: 'La contraseña debe tener al menos 8 caracteres.' };
        sessionStorage.removeItem(`reset:${email}`);
        return { ok: true };
    }
}
