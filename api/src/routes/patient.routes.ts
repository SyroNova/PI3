import { Router } from 'express';
import { createPatient, getPatientById, getPatientByIdentificacion } from '../controllers/patient.controller';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

router.post('/', createPatient);
router.get('/:id', getPatientById);
router.get('/identificacion/:identificacion', getPatientByIdentificacion);

export default router;
