export type Step = 'EMAIL' | 'RESET';

export class RecoveryModel {
  email = '';
  code = '';
  password = '';
  confirm = '';
  step: Step = 'EMAIL';

  setEmail(v: string){ this.email = v.trim(); }
  setCode(v: string){ this.code = v.trim(); }
  setPassword(v: string){ this.password = v; }
  setConfirm(v: string){ this.confirm = v; }

  validateEmail(): { email?: string } {
    if (!this.email) return { email: 'El correo es obligatorio.' };
    const ok = /^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/.test(this.email);
    return ok ? {} : { email: 'Ingresa un correo válido.' };
  }

  validateReset(): { code?: string; password?: string; confirm?: string } {
    const errs: any = {};
    if (!/^\d{6}$/.test(this.code)) errs.code = 'El código debe tener 6 dígitos.';
    if (!this.password || this.password.length < 8) errs.password = 'Mínimo 8 caracteres.';
    if (this.confirm !== this.password) errs.confirm = 'Las contraseñas no coinciden.';
    return errs;
  }
}