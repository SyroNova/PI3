import { RecoveryModel } from '../models/Recovery.js';
import { RecoveryView } from '../views/RecoveryView.js';
import { AuthService } from '../services/AuthService.js';

export class RecoveryController {
  private model = new RecoveryModel();
  private view = new RecoveryView();
  private auth = new AuthService();

  constructor(){
    this.view.onSubmitEmail((email) => this.handleSendCode(email));
    this.view.onSubmitReset((code, pwd, confirm) => this.handleReset(code, pwd, confirm));
    this.view.onResend(() => this.handleResend());
  }

  private async handleSendCode(email: string){
    this.model.setEmail(email);
    const err = this.model.validateEmail();
    this.view.showEmailError(err.email);
    if (err.email) return;

    this.view.setLoadingEmail(true);
    const res = await this.auth.requestReset(this.model.email);
    this.view.setLoadingEmail(false);

    if (!res.ok){
      this.view.showToast(res.message ?? 'No fue posible enviar el código.', 'error');
      return;
    }

    this.model.step = 'RESET';
    this.view.showStep('RESET', this.model.email);
    this.view.setResendCooldown(60);
    this.view.showToast('Código enviado al correo.', 'success');
  }

  private async handleResend(){
    this.view.setResendCooldown(60);
    const res = await this.auth.requestReset(this.model.email);
    if (res.ok) this.view.showToast('Se envió un nuevo código.', 'success');
    else this.view.showToast(res.message ?? 'No fue posible reenviar el código.', 'error');
  }

  private async handleReset(code: string, pwd: string, confirm: string){
    this.model.setCode(code);
    this.model.setPassword(pwd);
    this.model.setConfirm(confirm);

    const errs = this.model.validateReset();
    this.view.showResetErrors(errs);
    if (Object.keys(errs).length) return;

    this.view.setLoadingReset(true);
    const res = await this.auth.confirmReset(this.model.email, this.model.code, this.model.password);
    this.view.setLoadingReset(false);

    if (!res.ok){
      this.view.showToast(res.message ?? 'No fue posible restablecer la contraseña.', 'error');
      return;
    }

    this.view.showToast('¡Contraseña actualizada!', 'success');
    setTimeout(() => { window.location.href = './index.html'; }, 700);
  }
}