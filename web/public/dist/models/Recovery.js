export class RecoveryModel {
    constructor() {
        Object.defineProperty(this, "email", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: ''
        });
        Object.defineProperty(this, "code", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: ''
        });
        Object.defineProperty(this, "password", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: ''
        });
        Object.defineProperty(this, "confirm", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: ''
        });
        Object.defineProperty(this, "step", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'EMAIL'
        });
    }
    setEmail(v) { this.email = v.trim(); }
    setCode(v) { this.code = v.trim(); }
    setPassword(v) { this.password = v; }
    setConfirm(v) { this.confirm = v; }
    validateEmail() {
        if (!this.email)
            return { email: 'El correo es obligatorio.' };
        const ok = /^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/.test(this.email);
        return ok ? {} : { email: 'Ingresa un correo válido.' };
    }
    validateReset() {
        const errs = {};
        if (!/^\d{6}$/.test(this.code))
            errs.code = 'El código debe tener 6 dígitos.';
        if (!this.password || this.password.length < 8)
            errs.password = 'Mínimo 8 caracteres.';
        if (this.confirm !== this.password)
            errs.confirm = 'Las contraseñas no coinciden.';
        return errs;
    }
}
