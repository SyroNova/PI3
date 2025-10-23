export class UserModel {
    constructor() {
        Object.defineProperty(this, "creds", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: { username: '', password: '' }
        });
    }
    setUsername(username) { this.creds.username = username.trim(); }
    setPassword(password) { this.creds.password = password; }
    get data() { return { ...this.creds }; }
    validate() {
        const errors = {};
        if (!this.creds.username)
            errors.username = 'El usuario es obligatorio.';
        else if (this.creds.username.length < 3)
            errors.username = 'Mínimo 3 caracteres.';
        if (!this.creds.password)
            errors.password = 'La contraseña es obligatoria.';
        else if (this.creds.password.length < 6)
            errors.password = 'Mínimo 6 caracteres.';
        return errors;
    }
}
