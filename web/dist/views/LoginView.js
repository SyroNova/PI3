export class LoginView {
    constructor() {
        Object.defineProperty(this, "usernameInput", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: document.getElementById('username')
        });
        Object.defineProperty(this, "passwordInput", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: document.getElementById('password')
        });
        Object.defineProperty(this, "usernameError", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: document.getElementById('username-error')
        });
        Object.defineProperty(this, "passwordError", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: document.getElementById('password-error')
        });
        Object.defineProperty(this, "togglePwdBtn", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: document.getElementById('togglePwd')
        });
        Object.defineProperty(this, "form", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: document.getElementById('loginForm')
        });
        Object.defineProperty(this, "submitBtn", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: document.getElementById('submitBtn')
        });
        Object.defineProperty(this, "yearSpan", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: document.getElementById('year')
        });
        this.yearSpan.textContent = String(new Date().getFullYear());
        this.togglePwdBtn?.addEventListener('click', () => this.togglePasswordVisibility());
    }
    onSubmit(handler) {
        this.form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await handler(this.usernameInput.value, this.passwordInput.value);
        });
    }
    setLoading(loading) {
        if (loading) {
            this.submitBtn.classList.add('btn--loading');
            this.submitBtn.setAttribute('disabled', 'true');
        }
        else {
            this.submitBtn.classList.remove('btn--loading');
            this.submitBtn.removeAttribute('disabled');
        }
    }
    showErrors(errors) {
        this.usernameError.textContent = errors.username ?? '';
        this.passwordError.textContent = errors.password ?? '';
    }
    clearPassword() { this.passwordInput.value = ''; }
    focusFirstInvalid(errors) {
        if (errors.username) {
            this.usernameInput.focus();
            return;
        }
        if (errors.password) {
            this.passwordInput.focus();
        }
    }
    togglePasswordVisibility() {
        const isPwd = this.passwordInput.type === 'password';
        this.passwordInput.type = isPwd ? 'text' : 'password';
    }
    showToast(message, type = 'error') {
        const toast = document.createElement('div');
        toast.textContent = message;
        toast.setAttribute('role', 'status');
        Object.assign(toast.style, {
            position: 'fixed', left: '50%', bottom: '24px', transform: 'translateX(-50%)',
            background: type === 'success' ? '#059669' : '#dc2626', color: '#fff',
            padding: '10px 14px', borderRadius: '10px', boxShadow: '0 10px 20px rgba(0,0,0,.1)',
            fontWeight: '600', zIndex: '9999'
        });
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 2500);
    }
}
