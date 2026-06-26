import { Router } from 'express';
import {
  createRoom,
  joinRoom,
  getMyRooms,
  getRoomById,
  leaveRoom,
} from '../controllers/roomController';
import { protect } from '../middleware/auth';

const router = Router();

// All room routes require authentication
router.use(protect);

router.post('/', createRoom);
router.post('/join', joinRoom);
router.get('/', getMyRooms);
router.get('/:id', getRoomById);
router.delete('/:id/leave', leaveRoom);

export default router;