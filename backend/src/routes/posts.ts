import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { roleGuard } from '../middleware/roleGuard';
import {
  getPosts,
  getMyPosts,
  getPost,
  createPost,
  updatePost,
  publishPost,
  closePost,
  deletePost,
} from '../controllers/postsController';

const router = Router();

// Public
router.get('/', getPosts);

// Auth required — /mine MUST come before /:id
router.get('/mine', authenticate, getMyPosts);
router.get('/:id', authenticate, getPost);
router.post('/', authenticate, roleGuard('HEALTHCARE', 'ENGINEER'), createPost);
router.patch('/:id', authenticate, updatePost);
router.patch('/:id/publish', authenticate, publishPost);
router.patch('/:id/close', authenticate, closePost);
router.delete('/:id', authenticate, deletePost);

export default router;
