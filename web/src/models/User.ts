export type Credentials = { username: string; password: string; };
export type ValidationErrors = Partial<Record<keyof Credentials, string>>;

export class UserModel {
  private creds: Credentials = { username: '', password: '' };
  setUsername(username: string){ this.creds.username = username.trim(); }
  setPassword(password: string){ this.creds.password = password; }
  get data(): Credentials { return { ...this.creds }; }

  validate(): ValidationErrors {
    const errors: ValidationErrors = {};
    if (!this.creds.username) errors.username = 'El usuario es obligatorio.';
    else if (this.creds.username.length < 3) errors.username = 'Mínimo 3 caracteres.';
    if (!this.creds.password) errors.password = 'La contraseña es obligatoria.';
    else if (this.creds.password.length < 6) errors.password = 'Mínimo 6 caracteres.';
    return errors;
  }
}