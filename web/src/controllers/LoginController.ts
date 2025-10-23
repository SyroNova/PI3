import { UserModel } from '../models/User.js';
import { LoginView } from '../views/LoginView.js';
import { AuthService } from '../services/AuthService.js';

export class LoginController {
  private model = new UserModel();
  private view = new LoginView();
  private auth = new AuthService();

  constructor() {
    this.view.onSubmit((u, p) => this.handleSubmit(u, p));
  }

  private async handleSubmit(username: string, password: string) {
    this.model.setUsername(username);
    this.model.setPassword(password);

    console.log(username)

    const errors = this.model.validate();
    this.view.showErrors(errors);
    if (Object.keys(errors).length) { this.view.focusFirstInvalid(errors); return; }

    try {
      this.view.setLoading(true);
      const res = await this.auth.login(username, password);
      if (!res.ok) { this.view.showToast(res.message ?? 'Error de autenticación', 'error'); this.view.clearPassword(); return; }
      if (res.token) localStorage.setItem('electromed_token', res.token);
      this.view.showToast('¡Bienvenido a ElectroMed!', 'success');
      setTimeout(() => { window.location.href = '/dashboard.html'; }, 600);
    } catch {
      this.view.showToast('Ocurrió un error inesperado.', 'error');
    } finally {
      this.view.setLoading(false);
    }
  }
}