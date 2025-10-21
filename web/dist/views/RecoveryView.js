export class RecoveryView {
    constructor() {
        Object.defineProperty(this, "emailForm", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: document.getElementById('stepEmail')
        });
        Object.defineProperty(this, "recEmail", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: document.getElementById('recEmail')
        });
        Object.defineProperty(this, "recEmailErr", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: document.getElementById('recEmail-error')
        });
        Object.defineProperty(this, "resetForm", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: document.getElementById('stepReset')
        });
        Object.defineProperty(this, "sentTo", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: document.getElementById('sentTo')
        });
        Object.defineProperty(this, "recCode", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: document.getElementById('recCode')
        });
        Object.defineProperty(this, "recCodeErr", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: document.getElementById('recCode-error')
        });
        Object.defineProperty(this, "newPwd", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: document.getElementById('newPwd')
        });
        Object.defineProperty(this, "newPwdErr", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: document.getElementById('newPwd-error')
        });
        Object.defineProperty(this, "newPwd2", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: document.getElementById('newPwd2')
        });
        Object.defineProperty(this, "newPwd2Err", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: document.getElementById('newPwd2-error')
        });
        Object.defineProperty(this, "sendCodeBtn", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: document.getElementById('sendCodeBtn')
        });
        Object.defineProperty(this, "resetBtn", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: document.getElementById('resetBtn')
        });
        Object.defineProperty(this, "resendBtn", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: document.getElementById('resendBtn')
        });
        Object.defineProperty(this, "timer", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: document.getElementById('timer')
        });
        Object.defineProperty(this, "year", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: document.getElementById('year')
        });
        const toggle1 = document.querySelector('[data-toggle="pwd1"]');
        const toggle2 = document.querySelector('[data-toggle="pwd2"]');
        toggle1?.addEventListener('click', () => this.toggle(this.newPwd));
        toggle2?.addEventListener('click', () => this.toggle(this.newPwd2));
        if (this.year)
            this.year.textContent = String(new Date().getFullYear());
    }
    onSubmitEmail(handler) {
        this.emailForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await handler(this.recEmail.value);
        });
    }
    onSubmitReset(handler) {
        this.resetForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await handler(this.recCode.value, this.newPwd.value, this.newPwd2.value);
        });
    }
    onResend(handler) {
        this.resendBtn.addEventListener('click', async () => { await handler(); });
    }
    setLoadingEmail(v) { this.toggleLoading(this.sendCodeBtn, v); }
    setLoadingReset(v) { this.toggleLoading(this.resetBtn, v); }
    toggleLoading(btn, v) {
        if (v) {
            btn.classList.add('btn--loading');
            btn.setAttribute('disabled', 'true');
        }
        else {
            btn.classList.remove('btn--loading');
            btn.removeAttribute('disabled');
        }
    }
    showStep(step, email) {
        if (step === 'EMAIL') {
            this.emailForm.classList.remove('is-hidden');
            this.resetForm.classList.add('is-hidden');
        }
        else {
            this.emailForm.classList.add('is-hidden');
            this.resetForm.classList.remove('is-hidden');
            if (email)
                this.sentTo.textContent = email;
            this.recCode.focus();
        }
    }
    showEmailError(msg) { this.recEmailErr.textContent = msg ?? ''; }
    showResetErrors(errs) {
        this.recCodeErr.textContent = errs.code ?? '';
        this.newPwdErr.textContent = errs.password ?? '';
        this.newPwd2Err.textContent = errs.confirm ?? '';
    }
    clearResetErrors() { this.showResetErrors({}); }
    setResendCooldown(seconds) {
        this.resendBtn.setAttribute('disabled', 'true');
        this.timer.textContent = String(seconds);
        const iv = setInterval(() => {
            seconds -= 1;
            this.timer.textContent = String(seconds);
            if (seconds <= 0) {
                clearInterval(iv);
                this.resendBtn.removeAttribute('disabled');
                this.timer.textContent = '0';
            }
        }, 1000);
    }
    showToast(message, type = 'error') {
        const toast = document.createElement('div');
        toast.textContent = message;
        toast.setAttribute('role', 'status');
        Object.assign(toast.style, {
            position: 'fixed', left: '50%', bottom: '24px', transform: 'translateX(-50%)',
            background: type === 'success' ? '#059669' : '#dc2626',
            color: '#fff', padding: '10px 14px', borderRadius: '10px',
            boxShadow: '0 10px 20px rgba(0,0,0,.1)', fontWeight: '600', zIndex: '9999'
        });
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 2500);
    }
    toggle(input) {
        input.type = input.type === 'password' ? 'text' : 'password';
    }
}
