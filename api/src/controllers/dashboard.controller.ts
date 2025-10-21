import { Response } from 'express';
import pool from '../config/database';
import { AuthRequest } from '../middlewares/auth';

// GET /api/me
export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ ok: false, message: 'No autenticado' });
    }

    const [rows]: any = await pool.execute(
      'SELECT id, username, email, name, role FROM users WHERE id = ? LIMIT 1',
      [req.user.id]
    );

    if (!rows.length) {
      return res.status(404).json({ ok: false, message: 'Usuario no encontrado' });
    }

    return res.json(rows[0]);
  } catch (error: any) {
    console.error('Get me error:', error);
    return res.status(500).json({ ok: false, error: 'Error al obtener usuario' });
  }
};

// GET /api/dashboard/metrics
export const getMetrics = async (req: AuthRequest, res: Response) => {
  try {
    // Métricas de ejemplo: total pacientes activos, exámenes hoy, alertas críticas, etc.
    const [totalPatients]: any = await pool.execute(
      'SELECT COUNT(*) as count FROM patients'
    );

    const [activeHospitalizations]: any = await pool.execute(
      "SELECT COUNT(*) as count FROM hospitalizations WHERE estado = 'activa'"
    );

    const [todayTests]: any = await pool.execute(
      'SELECT COUNT(*) as count FROM electrolyte_tests WHERE DATE(exam_date) = CURDATE()'
    );

    const [criticalAlerts]: any = await pool.execute(
      `SELECT COUNT(*) as count FROM electrolyte_tests 
       WHERE DATE(exam_date) = CURDATE() 
       AND JSON_LENGTH(alertas) > 0`
    );

    const metrics = [
      { label: 'Pacientes Registrados', value: totalPatients[0].count },
      { label: 'Hospitalizaciones Activas', value: activeHospitalizations[0].count },
      { label: 'Exámenes Hoy', value: todayTests[0].count },
      { label: 'Alertas Críticas', value: criticalAlerts[0].count }
    ];

    return res.json(metrics);
  } catch (error: any) {
    console.error('Get metrics error:', error);
    return res.status(500).json({ ok: false, error: 'Error al obtener métricas' });
  }
};

// GET /api/dashboard/recent-patients
export const getRecentPatients = async (req: AuthRequest, res: Response) => {
  try {
    const [rows]: any = await pool.execute(
      `SELECT 
        CONCAT_WS(' ', p.primer_nombre, p.primer_apellido) as name,
        CONCAT(DATEDIFF(NOW(), et.exam_date), ' días') as lastAnalysisAgo,
        CASE 
          WHEN DATEDIFF(NOW(), et.exam_date) <= 1 THEN 'normal'
          WHEN DATEDIFF(NOW(), et.exam_date) <= 2 THEN 'warning'
          ELSE 'critical'
        END as level,
        CASE
          WHEN JSON_LENGTH(et.alertas) > 0 THEN CONCAT('Alertas: ', JSON_LENGTH(et.alertas))
          ELSE ''
        END as alertText
      FROM electrolyte_tests et
      JOIN patients p ON p.id = et.patient_id
      ORDER BY et.exam_date DESC
      LIMIT 10`
    );

    return res.json(rows);
  } catch (error: any) {
    console.error('Get recent patients error:', error);
    return res.status(500).json({ ok: false, error: 'Error al obtener pacientes recientes' });
  }
};
