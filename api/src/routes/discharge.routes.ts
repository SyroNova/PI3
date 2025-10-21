import { Router } from 'express';
import { createDischarge } from '../controllers/discharge.controller';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

router.use(authMiddleware);
router.post('/', createDischarge);

export default router;
