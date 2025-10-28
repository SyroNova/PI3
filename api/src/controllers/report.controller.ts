import { Response } from 'express';
import pool from '../config/database';
import { AuthRequest } from '../middlewares/auth';

// GET /api/reports/electrolytes?patient=&start=&end=&planta=
export const getReportData = async (req: AuthRequest, res: Response) => {
  try {
    const { patient, start, end, planta } = req.query;

    let query = `
      SELECT 
        et.id,
        p.id as patientId,
        CONCAT_WS(' ', p.primer_nombre, p.segundo_nombre, p.primer_apellido, p.segundo_apellido) as paciente,
        DATE_FORMAT(et.exam_date, '%Y-%m-%d') as examDate,
        et.planta,
        et.sodio,
        et.potasio,
        et.cloro,
        et.alertas,
        p.identificacion
      FROM electrolyte_tests et
      JOIN patients p ON p.id = et.patient_id
      WHERE 1=1
    `;
    const params: any[] = [];

    // Filtro por paciente
    if (patient) {
      query += ` AND (
        LOWER(CONCAT(p.primer_nombre, ' ', p.primer_apellido)) LIKE ? 
        OR p.identificacion LIKE ?
      )`;
      const searchTerm = `%${patient}%`;
      params.push(searchTerm, searchTerm);
    }

    // Filtro por rango de fechas
    if (start) {
      query += ` AND DATE(et.exam_date) >= ?`;
      params.push(start);
    }
    if (end) {
      query += ` AND DATE(et.exam_date) <= ?`;
      params.push(end);
    }

    // Filtro por planta
    if (planta) {
      query += ` AND et.planta = ?`;
      params.push(planta);
    }

    query += ` ORDER BY et.exam_date DESC, et.id DESC`;

    const [rows]: any = await pool.execute(query, params);

    const result = rows.map((row: any) => ({
      ...row,
      alertas: row.alertas ? structuredClone(row.alertas) : []
    }));

    return res.json(result);
  } catch (error: any) {
    console.error('Get report error:', error);
    return res.status(500).json({ ok: false, error: 'Error al obtener reporte' });
  }
};
