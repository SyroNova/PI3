import { Response } from 'express';
import pool from '../config/database';
import { AuthRequest } from '../middlewares/auth';

// GET /api/panel?planta=uci&paciente=&fecha=&estado=
export const getPanelData = async (req: AuthRequest, res: Response) => {
  try {
    const { planta, paciente, fecha, estado } = req.query;

    if (!planta) {
      return res.status(400).json({ ok: false, message: 'Parámetro planta requerido' });
    }

    let query = `
      SELECT 
        et.id,
        CONCAT_WS(' ', p.primer_nombre, p.segundo_nombre, p.primer_apellido, p.segundo_apellido) as paciente,
        DATE_FORMAT(et.exam_date, '%Y-%m-%d') as fechaExamen,
        et.planta,
        et.sodio as na,
        et.potasio as k,
        et.cloro as cl,
        et.alertas,
        p.id as patientId,
        p.identificacion
      FROM electrolyte_tests et
      JOIN patients p ON p.id = et.patient_id
      WHERE et.planta = ?
    `;
    const params: any[] = [planta];

    // Filtro por paciente (nombre o identificación)
    if (paciente) {
      query += ` AND (
        LOWER(CONCAT(p.primer_nombre, ' ', p.primer_apellido)) LIKE ? 
        OR p.identificacion LIKE ?
      )`;
      const searchTerm = `%${paciente}%`;
      params.push(searchTerm, searchTerm);
    }

    // Filtro por fecha exacta
    if (fecha) {
      query += ` AND DATE(et.exam_date) = ?`;
      params.push(fecha);
    }

    query += ` ORDER BY et.exam_date DESC, et.id DESC`;

    const [rows]: any = await pool.execute(query, params);


    // Calcular estado (activo si <= 2 días, vencido si > 2 días)
    const now = Date.now();
    const twoDaysMs = 2 * 24 * 60 * 60 * 1000;

    let result = rows.map((row: any) => ({
      ...row,
      alertas: row.alertas ? structuredClone(row.alertas) : []
    }));


    // Filtro por estado (activo/vencido) - client-side calculation
    if (estado === 'activo' || estado === 'vencido') {
      result = result.filter((row: any) => {
        const examDate = new Date(row.fechaExamen).getTime();
        const diff = now - examDate;
        const esActivo = diff <= twoDaysMs;
        return estado === 'activo' ? esActivo : !esActivo;
      });
    }
    return res.json(result);
  } catch (error: any) {
    console.error('Get panel error:', error);
    return res.status(500).json({ ok: false, error: 'Error al obtener datos del panel' });
  }
};
