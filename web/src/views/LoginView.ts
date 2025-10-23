import type { ValidationErrors } from '../models/User.js';

export class LoginView {
  private usernameInput = document.getElementById('username') as HTMLInputElement;
  private passwordInput = document.getElementById('password') as HTMLInputElement;
  private usernameError = document.getElementById('username-error') as HTMLParagraphElement;
  private passwordError = document.getElementById('password-error') as HTMLParagraphElement;
  private togglePwdBtn = document.getElementById('togglePwd') as HTMLButtonElement;
  private form = document.getElementById('loginForm') as HTMLFormElement;
  private submitBtn = document.getElementById('submitBtn') as HTMLButtonElement;
  private yearSpan = document.getElementById('year') as HTMLSpanElement;

  constructor() {
    this.yearSpan.textContent = String(new Date().getFullYear());
    this.togglePwdBtn?.addEventListener('click', () => this.togglePasswordVisibility());
  }

  onSubmit(handler: (username: string, password: string) => Promise<void>) {
    this.form.addEventListener('submit', async (e) => {
      e.preventDefault();
      await handler(this.usernameInput.value, this.passwordInput.value);
    });
  }

  setLoading(loading: boolean) {
    if (loading) { this.submitBtn.classList.add('btn--loading'); this.submitBtn.setAttribute('disabled', 'true'); }
    else { this.submitBtn.classList.remove('btn--loading'); this.submitBtn.removeAttribute('disabled'); }
  }

  showErrors(errors: ValidationErrors) {
    this.usernameError.textContent = errors.username ?? '';
    this.passwordError.textContent = errors.password ?? '';
  }

  clearPassword(){ this.passwordInput.value = ''; }
  focusFirstInvalid(errors: ValidationErrors) {
    if (errors.username) { this.usernameInput.focus(); return; }
    if (errors.password) { this.passwordInput.focus(); }
  }

  private togglePasswordVisibility() {
    const isPwd = this.passwordInput.type === 'password';
    this.passwordInput.type = isPwd ? 'text' : 'password';
  }

  showToast(message: string, type: 'error'|'success' = 'error') {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.setAttribute('role', 'status');
    Object.assign(toast.style, {
      position: 'fixed', left: '50%', bottom: '24px', transform: 'translateX(-50%)',
      background: type === 'success' ? '#059669' : '#dc2626', color: '#fff',
      padding: '10px 14px', borderRadius: '10px', boxShadow: '0 10px 20px rgba(0,0,0,.1)',
      fontWeight: '600', zIndex: '9999'
    } as CSSStyleDeclaration);
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2500);
  }
}