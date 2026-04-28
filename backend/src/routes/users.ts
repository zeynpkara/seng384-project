import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { getProfile, updateProfile, exportData, deleteAccount } from '../controllers/usersController';

const router = Router();

router.use(authenticate);

router.get('/me', getProfile);
router.patch('/me', updateProfile);
router.get('/me/export', exportData);
router.delete('/me', deleteAccount);

export default router;
