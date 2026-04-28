import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  checkInterest,
  expressInterest,
  acceptNda,
  proposeSlots,
  confirmSlot,
  rejectMeeting,
  getMyMeetings,
} from '../controllers/meetingsController';

const router = Router();

// Static paths must come before /:id
router.get('/mine', authenticate, getMyMeetings);
router.get('/check/:postId', authenticate, checkInterest);
router.post('/express-interest/:postId', authenticate, expressInterest);

// Dynamic /:id paths
router.post('/:id/accept-nda', authenticate, acceptNda);
router.post('/:id/propose-slots', authenticate, proposeSlots);
router.patch('/:id/confirm-slot', authenticate, confirmSlot);
router.patch('/:id/reject', authenticate, rejectMeeting);

export default router;
