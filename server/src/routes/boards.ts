import { Router, Request, Response } from 'express';
import { protect, AuthRequest } from '../middleware/auth';
import Board from '../models/Board';
import Room from '../models/Room';
import { verifyToken } from '../config/jwt';

const router = Router();
router.use(protect);

// GET /api/boards/:roomId
router.get('/:roomId', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const roomId = req.params['roomId'];
    const userId = req.user?.userId;

    const room = await Room.findById(roomId);
    if (!room) {
      res.status(404).json({ message: 'Room not found' });
      return;
    }

    const isMember = room.participants.some(
      (p) => p.toString() === userId
    );
    if (!isMember) {
      res.status(403).json({ message: 'Access denied' });
      return;
    }

    const board = await Board.findOne({ roomId });
    res.json({ strokes: board?.strokes || [], savedAt: board?.updatedAt || null });
  } catch {
    res.status(500).json({ message: 'Failed to fetch board' });
  }
});

// PUT /api/boards/:roomId
router.put('/:roomId', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const roomId = req.params['roomId'];
    const userId = req.user?.userId;
    const strokes = req.body['strokes'];

    if (!Array.isArray(strokes)) {
      res.status(400).json({ message: 'strokes must be an array' });
      return;
    }

    const room = await Room.findById(roomId);
    if (!room) {
      res.status(404).json({ message: 'Room not found' });
      return;
    }

    const isMember = room.participants.some(
      (p) => p.toString() === userId
    );
    if (!isMember) {
      res.status(403).json({ message: 'Access denied' });
      return;
    }

    const board = await Board.findOneAndUpdate(
      { roomId },
      { $set: { strokes } },
      { upsert: true, new: true }
    );

    res.json({
      message: 'Board saved',
      savedAt: board.updatedAt,
      strokeCount: strokes.length,
    });
  } catch {
    res.status(500).json({ message: 'Failed to save board' });
  }
});

// POST /api/boards/:roomId/beacon
router.post('/:roomId/beacon', async (req: Request, res: Response): Promise<void> => {
  try {
    const roomId = req.params['roomId'];
    const token = req.query['token'] as string;

    if (!token) {
      res.status(401).json({ message: 'No token' });
      return;
    }

    const decoded = verifyToken(token);

    const room = await Room.findById(roomId);
    if (!room) { res.status(404).end(); return; }

    const isMember = room.participants.some(
      (p) => p.toString() === decoded.userId
    );
    if (!isMember) { res.status(403).end(); return; }

    const strokes = req.body['strokes'];
    if (Array.isArray(strokes)) {
      await Board.findOneAndUpdate(
        { roomId },
        { $set: { strokes } },
        { upsert: true }
      );
    }

    res.status(204).end();
  } catch {
    res.status(500).end();
  }
});

export default router;