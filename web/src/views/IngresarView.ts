import type { Patient } from '../models/Patient.js';

export class IngresarView {
  private form: HTMLFormElement;
  private errorsBox: HTMLElement | null;

  constructor(formSelector = '#patient-form') {
    const form = document.querySelector(formSelector);
    if (!(form instanceof HTMLFormElement)) {
      throw new Error('Formulario de paciente no encontrado');
    }
    this.form = form;
    this.errorsBox = document.getElementById('form-errors');
  }

  onSubmit(handler: (data: Patient) => Promise<void>): void {
    this.form.addEventListener('submit', async (e) => {
      // Si el HTML ya bloqueó por invalid, no procedemos
      if (!this.form.checkValidity()) return;
      e.preventDefault();
      const data = this.collect();
      await handler(data);
    });
  }

  showError(message: string): void {
    if (!this.errorsBox) return;
    this.errorsBox.innerHTML = message;
    this.errorsBox.style.display = 'block';
  }

  showSuccess(id: string, isOffline: boolean = false): void {
    if (!this.errorsBox) return;
    this.errorsBox.style.display = 'block';
    this.errorsBox.style.borderColor = '#22c55e';
    this.errorsBox.style.background = '#ecfdf5';
    this.errorsBox.style.color = '#166534';
    
    const offlineMessage = isOffline 
      ? ' <span style="background: #f59e0b; color: #fff; padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.85rem;">📵 Guardado offline</span>' 
      : '';
    
    this.errorsBox.innerHTML = `Paciente registrado correctamente. ID: <strong>${id}</strong>${offlineMessage}`;
  }

  setSubmitting(submitting: boolean): void {
    const btn = this.form.querySelector('.btn-submit') as HTMLButtonElement | null;
    if (btn) {
      btn.disabled = submitting;
      btn.textContent = submitting ? 'Registrando…' : 'Registrar Paciente';
    }
  }

  private value(selector: string): string {
    const el = this.form.querySelector(selector) as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null;
    return el?.value?.trim() ?? '';
  }

  private collect(): Patient {
    return {
      identificacion: this.value('#identificacion'),
      primerNombre: this.value('#primer-nombre'),
      segundoNombre: this.value('#segundo-nombre') || undefined,
      primerApellido: this.value('#primer-apellido'),
      segundoApellido: this.value('#segundo-apellido') || undefined,
      edad: Number(this.value('#edad')),
      sexo: this.value('#sexo') as any,
      telefono: this.value('#telefono'),
      correo: this.value('#correo'),
      area: this.value('#Area'),
      departamento: this.value('#departamento'),
      ciudad: this.value('#ciudad'),
      eps: this.value('#eps'),
      fechaIngreso: this.value('#fecha-ingreso'),
      habitacion: this.value('#habitacion'),
      diagnostico: this.value('#diagnostico'),
      alergias: this.value('#alergias') || undefined,
      medicamentos: this.value('#medicamentos') || undefined,
      motivo: this.value('#motivo'),
    };
  }
}
