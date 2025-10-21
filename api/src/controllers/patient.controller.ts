import { Response } from 'express';
import pool from '../config/database';
import { AuthRequest } from '../middlewares/auth';

// Helper: calcular edad desde fecha de nacimiento
const calcularEdad = (fechaNacimiento: string): number => {
  const hoy = new Date();
  const nacimiento = new Date(fechaNacimiento);
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const mes = hoy.getMonth() - nacimiento.getMonth();
  if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
    edad--;
  }
  return edad;
};

// POST /api/patients - Crear paciente + hospitalización
export const createPatient = async (req: AuthRequest, res: Response) => {
  const conn = await pool.getConnection();
  try {
    const {
      identificacion, primerNombre, segundoNombre, primerApellido, segundoApellido,
      sexo, telefono, correo, departamento, ciudad, eps,
      fechaIngreso, area, habitacion, diagnostico, alergias, medicamentos, motivo
    } = req.body;

    // Validaciones básicas
    if (!identificacion || !primerNombre || !primerApellido || !sexo || !fechaIngreso || !area || !motivo) {
      return res.status(400).json({ ok: false, message: 'Faltan campos obligatorios' });
    }

    await conn.beginTransaction();

    // Normalizar planta (area) a lowercase enum
    const plantaNormalized = area.toLowerCase().replace(/\s+/g, '');
    const plantaMap: any = {
      'uci': 'uci',
      'urgencias': 'urgencias',
      'hospitalizacion': 'hospitalizacion',
      'hospitalización': 'hospitalizacion'
    };
    const planta = plantaMap[plantaNormalized] || 'hospitalizacion';

    // Calcular edad si hay fecha de nacimiento
    let edad: number | null = null;
    const fechaNacimiento = req.body.fechaNacimiento || req.body['fecha-nacimiento'];
    if (fechaNacimiento) {
      edad = calcularEdad(fechaNacimiento);
    }

    // Verificar si paciente ya existe
    const [existing]: any = await conn.execute(
      'SELECT id FROM patients WHERE identificacion = ? LIMIT 1',
      [identificacion]
    );

    let patientId: number;

    if (existing.length) {
      // Actualizar paciente existente
      patientId = existing[0].id;
      await conn.execute(
        `UPDATE patients SET 
          primer_nombre = ?, segundo_nombre = ?, primer_apellido = ?, segundo_apellido = ?,
          sexo = ?, fecha_nacimiento = ?, edad = ?, telefono = ?, correo = ?,
          departamento = ?, ciudad = ?, eps = ?, updated_at = NOW()
         WHERE id = ?`,
        [
          primerNombre, segundoNombre || null, primerApellido, segundoApellido || null,
          sexo, fechaNacimiento || null, edad, telefono || null, correo || null,
          departamento || null, ciudad || null, eps || null,
          patientId
        ]
      );
    } else {
      // Crear nuevo paciente
      const [result]: any = await conn.execute(
        `INSERT INTO patients 
         (identificacion, primer_nombre, segundo_nombre, primer_apellido, segundo_apellido,
          sexo, fecha_nacimiento, edad, telefono, correo, departamento, ciudad, eps)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          identificacion, primerNombre, segundoNombre || null, primerApellido, segundoApellido || null,
          sexo, fechaNacimiento || null, edad, telefono || null, correo || null,
          departamento || null, ciudad || null, eps || null
        ]
      );
      patientId = result.insertId;
    }

    // Crear hospitalización
    const [hospResult]: any = await conn.execute(
      `INSERT INTO hospitalizations 
       (patient_id, fecha_ingreso, planta, habitacion, diagnostico, alergias, medicamentos, motivo, created_by)
       VALUES (?,?,?,?,?,?,?,?,?)`,
      [
        patientId, fechaIngreso, planta, habitacion || null, diagnostico || null,
        alergias || null, medicamentos || null, motivo, req.user?.id || null
      ]
    );

    await conn.commit();

    return res.status(201).json({
      ok: true,
      id: String(patientId),
      hospitalizationId: hospResult.insertId
    });
  } catch (error: any) {
    await conn.rollback();
    console.error('Create patient error:', error);
    return res.status(500).json({ ok: false, error: 'Error al crear paciente' });
  } finally {
    conn.release();
  }
};

// GET /api/patients/:id
export const getPatientById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    const [rows]: any = await pool.execute(
      `SELECT p.*, 
        (SELECT JSON_ARRAYAGG(JSON_OBJECT(
          'id', h.id,
          'fecha_ingreso', h.fecha_ingreso,
          'planta', h.planta,
          'habitacion', h.habitacion,
          'diagnostico', h.diagnostico,
          'estado', h.estado
        ))
        FROM hospitalizations h WHERE h.patient_id = p.id
        ) as hospitalizations
       FROM patients p WHERE p.id = ? LIMIT 1`,
      [id]
    );

    console.log(rows)

    if (!rows.length) {
      return res.status(404).json({ ok: false, message: 'Paciente no encontrado' });
    }

    return res.json({ ok: true, patient: rows[0] });
  } catch (error: any) {
    console.error('Get patient error:', error);
    return res.status(500).json({ ok: false, error: 'Error al obtener paciente' });
  }
};

// GET /api/patients/identificacion/:identificacion
export const getPatientByIdentificacion = async (req: AuthRequest, res: Response) => {
  try {
    const { identificacion } = req.params;
    
    const [rows]: any = await pool.execute(
      `SELECT p.*,
        (SELECT JSON_ARRAYAGG(JSON_OBJECT(
          'id', h.id,
          'fecha_ingreso', h.fecha_ingreso,
          'planta', h.planta,
          'habitacion', h.habitacion,
          'diagnostico', h.diagnostico,
          'estado', h.estado
        ))
        FROM hospitalizations h WHERE h.patient_id = p.id
        ORDER BY h.fecha_ingreso DESC
        ) as hospitalizations
       FROM patients p WHERE p.identificacion = ? LIMIT 1`,
      [identificacion]
    );

    if (!rows.length) {
      return res.status(404).json({ ok: false, message: 'Paciente no encontrado' });
    }

    return res.json({ ok: true, patient: rows[0] });
  } catch (error: any) {
    console.error('Get patient error:', error);
    return res.status(500).json({ ok: false, error: 'Error al obtener paciente' });
  }
};
