import { Router } from 'express';
import { getPanelData } from '../controllers/panel.controller';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

router.use(authMiddleware);
router.get('/', getPanelData);

export default router;
