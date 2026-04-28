import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { roleGuard } from '../middleware/roleGuard';
import {
  getUsers, suspendUser, deleteUser,
  adminGetPosts, adminDeletePost,
  getLogs, exportLogs,
} from '../controllers/adminController';

const router = Router();

router.use(authenticate, roleGuard('ADMIN'));

router.get('/users', getUsers);
router.patch('/users/:id/suspend', suspendUser);
router.delete('/users/:id', deleteUser);

router.get('/posts', adminGetPosts);
router.delete('/posts/:id', adminDeletePost);

// /logs/export MUST come before /logs to avoid /:id-style capture
router.get('/logs/export', exportLogs);
router.get('/logs', getLogs);

export default router;
