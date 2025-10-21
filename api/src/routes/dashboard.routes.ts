import { Router } from 'express';
import { getMe, getMetrics, getRecentPatients } from '../controllers/dashboard.controller';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

router.use(authMiddleware);
router.get('/me', getMe);
router.get('/metrics', getMetrics);
router.get('/recent-patients', getRecentPatients);

export default router;
