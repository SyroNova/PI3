import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { confirmReset, login, requestReset } from '../controllers/auth.controller';

const router = Router();

// Rate limiting para auth endpoints

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 intentos
  message: { ok: false, message: 'Demasiados intentos, intenta más tarde' }
});

router.post('/login', authLimiter, login);
router.post('/request-reset', authLimiter, requestReset);
router.post('/confirm-reset', authLimiter, confirmReset);

export default router;
