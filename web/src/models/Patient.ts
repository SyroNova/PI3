export type Sexo = 'Masculino' | 'Femenino';

export interface Patient {
  identificacion: string;
  primerNombre: string;
  segundoNombre?: string;
  primerApellido: string;
  segundoApellido?: string;
  edad: number;
  sexo: Sexo;
  telefono: string;
  correo: string;
  area: string;
  departamento: string;
  ciudad: string;
  eps: string;
  fechaIngreso: string; // ISO date (yyyy-mm-dd)
  habitacion: string;
  diagnostico: string;
  alergias?: string;
  medicamentos?: string;
  motivo: string;
}
