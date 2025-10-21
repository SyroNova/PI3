import { Router } from 'express';
import { getReportData } from '../controllers/report.controller';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

router.use(authMiddleware);
router.get('/electrolytes', getReportData);

export default router;
