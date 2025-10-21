import bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import pool from '../config/database';
import transporter from '../config/mailer';

// Helper: generar código 6 dígitos
const generateCode = () => String(Math.floor(100000 + Math.random() * 900000));

// POST /api/auth/login
export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ ok: false, message: 'Usuario y contraseña requeridos' });
    }

    const [rows]: any = await pool.execute(
      'SELECT id, username, email, name, role, password_hash, is_active FROM users WHERE username = ? LIMIT 1',
      [username]
    );


    if (!rows.length) {
      return res.status(401).json({ ok: false, message: 'Credenciales inválidas' });
    }

    const user = rows[0];

    
    if (!user.is_active) {
      return res.status(403).json({ ok: false, message: 'Usuario inactivo' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ ok: false, message: 'Credenciales inválidas' });
    }


    // Actualizar last_login
    await pool.execute('UPDATE users SET last_login_at = NOW() WHERE id = ?', [user.id]);

    // Generar JWT
    const secret = process.env.JWT_SECRET || 'default_secret';
    const payload = { id: user.id, username: user.username, email: user.email, role: user.role };
    const token = jwt.sign(payload, secret, { expiresIn: '7d' } as any);

    return res.json({ ok: true, token });
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({ ok: false, message: 'Error en el login' });
  }
};

// POST /api/auth/request-reset
export const requestReset = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ ok: false, message: 'Email requerido' });
    }

    const [rows]: any = await pool.execute(
      'SELECT id, email, name FROM users WHERE email = ? LIMIT 1',
      [email]
    );

    // Siempre responder ok para evitar enumeración de usuarios
    if (!rows.length) {
      return res.json({ ok: true });
    }

    const user = rows[0];

    // Invalidar códigos anteriores no usados
    await pool.execute(
      'DELETE FROM password_resets WHERE email = ? AND used_at IS NULL',
      [email]
    );

    const code = generateCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutos

    await pool.execute(
      'INSERT INTO password_resets (user_id, email, code, expires_at) VALUES (?,?,?,?)',
      [user.id, user.email, code, expiresAt]
    );

    // Enviar email
    await transporter.sendMail({
      from: process.env.MAIL_FROM || 'no-reply@electromed.local',
      to: user.email,
      subject: 'Código de recuperación de ElectroMed',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0A4173;">Recuperación de Contraseña</h2>
          <p>Hola ${user.name || 'Usuario'},</p>
          <p>Tu código de verificación es:</p>
          <div style="background: #f3f4f6; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: 700; letter-spacing: 4px; color: #0A4173;">${code}</span>
          </div>
          <p>Este código expira en <strong>10 minutos</strong>.</p>
          <p>Si no solicitaste este cambio, ignora este mensaje.</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          <p style="color: #6b7280; font-size: 12px;">© ${new Date().getFullYear()} ElectroMed. Todos los derechos reservados.</p>
        </div>
      `,
    });

    return res.json({ ok: true });
  } catch (error: any) {
    console.error('Request reset error:', error);
    return res.status(500).json({ ok: false, message: 'Error al enviar el código' });
  }
};

// POST /api/auth/confirm-reset
export const confirmReset = async (req: Request, res: Response) => {
  try {
    const { email, code, newPassword } = req.body;
    
    if (!email || !code || !newPassword) {
      return res.status(400).json({ ok: false, message: 'Campos requeridos' });
    }

    if (String(code).length !== 6) {
      return res.status(400).json({ ok: false, message: 'Código inválido' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ ok: false, message: 'La contraseña debe tener al menos 8 caracteres' });
    }

    const [resets]: any = await pool.execute(
      `SELECT pr.id, pr.user_id, pr.expires_at, pr.used_at, u.id as uid
       FROM password_resets pr
       LEFT JOIN users u ON u.id = pr.user_id
       WHERE pr.email = ? AND pr.code = ?
       ORDER BY pr.id DESC LIMIT 1`,
      [email, code]
    );

    if (!resets.length) {
      return res.status(400).json({ ok: false, message: 'Código inválido' });
    }

    const reset = resets[0];
    
    if (reset.used_at) {
      return res.status(400).json({ ok: false, message: 'Código ya utilizado' });
    }

    if (new Date(reset.expires_at) < new Date()) {
      return res.status(410).json({ ok: false, message: 'Código expirado' });
    }

    if (!reset.uid) {
      return res.status(400).json({ ok: false, message: 'Usuario no encontrado' });
    }

    // Hash nueva contraseña
    const hash = await bcrypt.hash(newPassword, 10);
    
    await pool.execute(
      'UPDATE users SET password_hash = ?, updated_at = NOW() WHERE id = ?',
      [hash, reset.uid]
    );

    // Marcar código como usado
    await pool.execute(
      'UPDATE password_resets SET used_at = NOW() WHERE id = ?',
      [reset.id]
    );

    return res.json({ ok: true });
  } catch (error: any) {
    console.error('Confirm reset error:', error);
    return res.status(500).json({ ok: false, message: 'No se pudo restablecer la contraseña' });
  }
};
