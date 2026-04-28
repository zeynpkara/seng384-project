import { Router } from 'express';
import { eduEmail } from '../middleware/eduEmail';
import { authenticate } from '../middleware/auth';
import { register, verifyEmail, login, logout } from '../controllers/authController';

const router = Router();

router.post('/register', eduEmail, register);
router.get('/verify/:token', verifyEmail);
router.post('/login', login);
router.post('/logout', authenticate, logout);

export default router;
