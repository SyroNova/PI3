import { Response } from 'express';
import pool from '../config/database';
import { AuthRequest } from '../middlewares/auth';
import { isFirebaseInitialized, sendPushToTokens } from '../services/fcm';

export async function registerToken(req: AuthRequest, res: Response) {
  try {
    const { token, platform } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    if (!token || typeof token !== 'string') {
      return res.status(400).json({ error: 'Token requerido' });
    }

    const validPlatforms = ['android', 'ios', 'web', 'windows', 'macos', 'linux', 'unknown'];
    const finalPlatform = validPlatforms.includes(platform) ? platform : 'unknown';

    // Upsert: INSERT ... ON DUPLICATE KEY UPDATE
    await pool.execute(
      `INSERT INTO user_devices (user_id, token, platform, last_seen)
       VALUES (?, ?, ?, NOW())
       ON DUPLICATE KEY UPDATE platform = VALUES(platform), last_seen = NOW()`,
      [userId, token, finalPlatform]
    );

    res.json({ ok: true, message: 'Token registrado correctamente' });
  } catch (error) {
    console.error('Error registrando token:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

export async function testPush(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    if (!isFirebaseInitialized()) {
      return res.status(503).json({ error: 'Firebase no está configurado en el servidor' });
    }

    // Obtener tokens del usuario actual
    const [rows] = await pool.execute<any[]>(
      'SELECT token FROM user_devices WHERE user_id = ?',
      [userId]
    );

    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: 'No se encontraron dispositivos registrados para este usuario' });
    }

    const tokens = rows.map((r: any) => r.token);
    const title = req.body.title || 'Prueba de ElectroMed';
    const body = req.body.body || 'Esta es una notificación de prueba';
    const data = req.body.data || { type: 'test' };

    const result = await sendPushToTokens(tokens, title, body, data);

    res.json({
      ok: true,
      message: 'Notificación enviada',
      sent: result.success,
      failed: result.failure,
      total: tokens.length,
    });
  } catch (error) {
    console.error('Error enviando push de prueba:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}
