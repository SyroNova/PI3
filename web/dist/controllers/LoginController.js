import { UserModel } from '../models/User.js';
import { LoginView } from '../views/LoginView.js';
import { AuthService } from '../services/AuthService.js';
export class LoginController {
    constructor() {
        Object.defineProperty(this, "model", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new UserModel()
        });
        Object.defineProperty(this, "view", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new LoginView()
        });
        Object.defineProperty(this, "auth", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new AuthService()
        });
        this.view.onSubmit((u, p) => this.handleSubmit(u, p));
    }
    async handleSubmit(username, password) {
        this.model.setUsername(username);
        this.model.setPassword(password);
        const errors = this.model.validate();
        this.view.showErrors(errors);
        if (Object.keys(errors).length) {
            this.view.focusFirstInvalid(errors);
            return;
        }
        try {
            this.view.setLoading(true);
            const res = await this.auth.login(username, password);
            if (!res.ok) {
                this.view.showToast(res.message ?? 'Error de autenticación', 'error');
                this.view.clearPassword();
                return;
            }
            if (res.token)
                localStorage.setItem('electromed_token', res.token);
            this.view.showToast('¡Bienvenido a ElectroMed!', 'success');
            setTimeout(() => { window.location.href = '/dashboard.html'; }, 600);
        }
        catch {
            this.view.showToast('Ocurrió un error inesperado.', 'error');
        }
        finally {
            this.view.setLoading(false);
        }
    }
}
