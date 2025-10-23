import type { Step } from '../models/Recovery.js';

export class RecoveryView {
  emailForm = document.getElementById('stepEmail') as HTMLFormElement;
  recEmail = document.getElementById('recEmail') as HTMLInputElement;
  recEmailErr = document.getElementById('recEmail-error') as HTMLParagraphElement;

  resetForm = document.getElementById('stepReset') as HTMLFormElement;
  sentTo = document.getElementById('sentTo') as HTMLSpanElement;
  recCode = document.getElementById('recCode') as HTMLInputElement;
  recCodeErr = document.getElementById('recCode-error') as HTMLParagraphElement;
  newPwd = document.getElementById('newPwd') as HTMLInputElement;
  newPwdErr = document.getElementById('newPwd-error') as HTMLParagraphElement;
  newPwd2 = document.getElementById('newPwd2') as HTMLInputElement;
  newPwd2Err = document.getElementById('newPwd2-error') as HTMLParagraphElement;

  sendCodeBtn = document.getElementById('sendCodeBtn') as HTMLButtonElement;
  resetBtn = document.getElementById('resetBtn') as HTMLButtonElement;
  resendBtn = document.getElementById('resendBtn') as HTMLButtonElement;
  timer = document.getElementById('timer') as HTMLSpanElement;
  year = document.getElementById('year') as HTMLSpanElement;

  constructor(){
    const toggle1 = document.querySelector('[data-toggle="pwd1"]') as HTMLButtonElement | null;
    const toggle2 = document.querySelector('[data-toggle="pwd2"]') as HTMLButtonElement | null;
    toggle1?.addEventListener('click', () => this.toggle(this.newPwd));
    toggle2?.addEventListener('click', () => this.toggle(this.newPwd2));
    if (this.year) this.year.textContent = String(new Date().getFullYear());
  }

  onSubmitEmail(handler: (email: string) => Promise<void>){
    this.emailForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      await handler(this.recEmail.value);
    });
  }

  onSubmitReset(handler: (code: string, pwd: string, confirm: string) => Promise<void>){
    this.resetForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      await handler(this.recCode.value, this.newPwd.value, this.newPwd2.value);
    });
  }

  onResend(handler: () => Promise<void>){
    this.resendBtn.addEventListener('click', async () => { await handler(); });
  }

  setLoadingEmail(v: boolean){ this.toggleLoading(this.sendCodeBtn, v); }
  setLoadingReset(v: boolean){ this.toggleLoading(this.resetBtn, v); }
  private toggleLoading(btn: HTMLButtonElement, v: boolean){
    if (v){ btn.classList.add('btn--loading'); btn.setAttribute('disabled','true'); }
    else { btn.classList.remove('btn--loading'); btn.removeAttribute('disabled'); }
  }

  showStep(step: Step, email?: string){
    if (step === 'EMAIL'){
      this.emailForm.classList.remove('is-hidden');
      this.resetForm.classList.add('is-hidden');
    } else {
      this.emailForm.classList.add('is-hidden');
      this.resetForm.classList.remove('is-hidden');
      if (email) this.sentTo.textContent = email;
      this.recCode.focus();
    }
  }

  showEmailError(msg?: string){ this.recEmailErr.textContent = msg ?? ''; }
  showResetErrors(errs: { code?: string; password?: string; confirm?: string }){
    this.recCodeErr.textContent = errs.code ?? '';
    this.newPwdErr.textContent = errs.password ?? '';
    this.newPwd2Err.textContent = errs.confirm ?? '';
  }
  clearResetErrors(){ this.showResetErrors({}); }

  setResendCooldown(seconds: number){
    this.resendBtn.setAttribute('disabled','true');
    this.timer.textContent = String(seconds);
    const iv = setInterval(() => {
      seconds -= 1;
      this.timer.textContent = String(seconds);
      if (seconds <= 0){
        clearInterval(iv);
        this.resendBtn.removeAttribute('disabled');
        this.timer.textContent = '0';
      }
    }, 1000);
  }

  showToast(message: string, type: 'error'|'success' = 'error'){
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.setAttribute('role', 'status');
    Object.assign(toast.style, {
      position: 'fixed', left: '50%', bottom: '24px', transform: 'translateX(-50%)',
      background: type === 'success' ? '#059669' : '#dc2626',
      color: '#fff', padding: '10px 14px', borderRadius: '10px',
      boxShadow: '0 10px 20px rgba(0,0,0,.1)', fontWeight: '600', zIndex: '9999'
    } as CSSStyleDeclaration);
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2500);
  }

  private toggle(input: HTMLInputElement){
    input.type = input.type === 'password' ? 'text' : 'password';
  }
}