import { Router, Response } from 'express';
import { protect, AuthRequest } from '../middleware/auth';
import Board from '../models/Board';
import Room from '../models/Room';

const router = Router();
router.use(protect);

// GET /api/boards/:roomId — fetch board state for a room
router.get('/:roomId', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { roomId } = req.params;
    const userId = req.user?.userId;

    // Verify the user is a room member
    const room = await Room.findById(roomId);
    if (!room) { res.status(404).json({ message: 'Room not found' }); return; }

    const isMember = room.participants.some((p) => p.toString() === userId);
    if (!isMember) { res.status(403).json({ message: 'Access denied' }); return; }

    const board = await Board.findOne({ roomId });
    res.json({ strokes: board?.strokes || [] });
  } catch {
    res.status(500).json({ message: 'Failed to fetch board' });
  }
});

export default router;