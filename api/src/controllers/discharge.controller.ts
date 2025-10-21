import { Response } from 'express';
import pool from '../config/database';
import { AuthRequest } from '../middlewares/auth';

// POST /api/discharges - Dar de alta (discharge)
export const createDischarge = async (req: AuthRequest, res: Response) => {
  const conn = await pool.getConnection();
  try {
    const {
      hospitalizationId, fechaAlta, motivo, tipoEgreso, destino,
      epicrisis, indicaciones, responsable, reingresoRiesgo, observaciones
    } = req.body;

    if (!hospitalizationId || !fechaAlta || !motivo || !tipoEgreso || !destino) {
      return res.status(400).json({ ok: false, message: 'Faltan campos obligatorios' });
    }

    await conn.beginTransaction();

    // Verificar que la hospitalización existe y está activa
    const [hosp]: any = await conn.execute(
      "SELECT id, estado FROM hospitalizations WHERE id = ? AND estado = 'activa' LIMIT 1",
      [hospitalizationId]
    );

    if (!hosp.length) {
      await conn.rollback();
      return res.status(400).json({ ok: false, message: 'Hospitalización no encontrada o ya cerrada' });
    }

    // Normalizar enums
    const motivoMap: any = {
      'mejoria': 'mejoria',
      'mejoría': 'mejoria',
      'remision': 'remision',
      'remisión': 'remision',
      'traslado': 'remision',
      'voluntario': 'voluntario',
      'fallecimiento': 'fallecimiento'
    };
    const motivoNorm = motivoMap[motivo.toLowerCase()] || 'mejoria';

    const destinoMap: any = {
      'domicilio': 'domicilio',
      'ambulatorio': 'ambulatorio',
      'rehabilitacion': 'rehabilitacion',
      'rehabilitación': 'rehabilitacion',
      'otra_institucion': 'otra_institucion',
      'otra institución': 'otra_institucion'
    };
    const destinoNorm = destinoMap[destino.toLowerCase()] || 'domicilio';

    const riesgoMap: any = {
      'bajo': 'bajo',
      'medio': 'medio',
      'alto': 'alto'
    };
    const riesgoNorm = reingresoRiesgo ? (riesgoMap[reingresoRiesgo.toLowerCase()] || null) : null;

    // Crear discharge
    const [result]: any = await conn.execute(
      `INSERT INTO discharges 
       (hospitalization_id, fecha_alta, motivo, tipo_egreso, destino, epicrisis, 
        indicaciones, responsable, reingreso_riesgo, observaciones, created_by)
       VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
      [
        hospitalizationId, fechaAlta, motivoNorm, tipoEgreso, destinoNorm,
        epicrisis || null, indicaciones || null, responsable || null,
        riesgoNorm, observaciones || null, req.user?.id || null
      ]
    );

    // El trigger ya marca la hospitalización como cerrada, pero por si acaso:
    await conn.execute(
      "UPDATE hospitalizations SET estado = 'cerrada', updated_at = NOW() WHERE id = ?",
      [hospitalizationId]
    );

    await conn.commit();

    return res.status(201).json({ ok: true, id: result.insertId });
  } catch (error: any) {
    await conn.rollback();
    console.error('Create discharge error:', error);
    return res.status(500).json({ ok: false, error: 'Error al crear alta' });
  } finally {
    conn.release();
  }
};
