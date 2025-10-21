import { Router } from 'express';
import { registerToken, testPush } from '../controllers/device.controller';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

// Todas las rutas de dispositivos requieren autenticación
router.use(authMiddleware);

// POST /api/devices/register-token
// Body: { token: string, platform: 'android'|'ios'|'web'|... }
router.post('/register-token', registerToken);

// POST /api/devices/test
// Body (opcional): { title?: string, body?: string, data?: object }
router.post('/test', testPush);

export default router;
