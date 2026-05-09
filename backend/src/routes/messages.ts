import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { getMessages, sendMessage } from '../controllers/messagesController';

const router = Router();

router.use(authenticate);

router.get('/:meetingId', getMessages);
router.post('/:meetingId', sendMessage);

export default router;
