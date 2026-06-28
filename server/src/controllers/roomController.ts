import { Response } from 'express';
import Room from '../models/Room';
import { AuthRequest } from '../middleware/auth';
import { generateInviteCode } from '../config/inviteCode';
import mongoose from 'mongoose';

// POST /api/rooms — create a new room
export const createRoom = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const name = req.body['name'];
    const userId = req.user?.userId;

    if (!userId) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
    }

    if (!name || !name.trim()) {
      res.status(400).json({ message: 'Room name is required' });
      return;
    }

    // Keep generating until we get a unique code (collision is extremely rare)
    let inviteCode = generateInviteCode();
    let exists = await Room.findOne({ inviteCode });
    while (exists) {
      inviteCode = generateInviteCode();
      exists = await Room.findOne({ inviteCode });
    }

    const room = await Room.create({
      name: String(name).trim(),
      inviteCode,
      owner: userId,
      participants: [userId],  // creator is automatically a participant
    });

    await room.populate('owner', 'name email');
    await room.populate('participants', 'name email');

    res.status(201).json({ room });
  } catch (error) {
    console.error('Create room error:', error);
    res.status(500).json({ message: 'Failed to create room' });
  }
};

// POST /api/rooms/join — join via invite code
export const joinRoom = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const inviteCode = req.body['inviteCode'];
    const userId = req.user?.userId;

    if (!inviteCode) {
      res.status(400).json({ message: 'Invite code is required' });
      return;
    }

    const room = await Room.findOne({ inviteCode: String(inviteCode).toUpperCase() });

    if (!room) {
      res.status(404).json({ message: 'Room not found — check your invite code' });
      return;
    }

    const alreadyIn = room.participants.some(
      (p) => p.toString() === userId
    );

    if (!alreadyIn && userId) {
      room.participants.push(new mongoose.Types.ObjectId(userId));
      await room.save();
    }

    await room.populate('owner', 'name email');
    await room.populate('participants', 'name email');

    res.json({ room });
  } catch (error) {
    console.error('Join room error:', error);
    res.status(500).json({ message: 'Failed to join room' });
  }
};

// GET /api/rooms — get all rooms the user belongs to
export const getMyRooms = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    const rooms = await Room.find({ participants: userId })
      .populate('owner', 'name email')
      .populate('participants', 'name email')
      .sort({ updatedAt: -1 });

    res.json({ rooms });
  } catch (error) {
    console.error('Get rooms error:', error);
    res.status(500).json({ message: 'Failed to fetch rooms' });
  }
};

// GET /api/rooms/:id — get a single room by ID
export const getRoomById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const id = req.params['id'];

    const room = await Room.findById(id)
      .populate('owner', 'name email')
      .populate('participants', 'name email');

    if (!room) {
      res.status(404).json({ message: 'Room not found' });
      return;
    }

    const isMember = room.participants.some(
      (p: any) => p._id.toString() === userId
    );

    if (!isMember) {
      res.status(403).json({ message: 'You are not a member of this room' });
      return;
    }

    res.json({ room });
  } catch (error) {
    console.error('Get room error:', error);
    res.status(500).json({ message: 'Failed to fetch room' });
  }
};

// DELETE /api/rooms/:id/leave — leave a room
export const leaveRoom = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const id = req.params['id'];

    const room = await Room.findById(id);

    if (!room) {
      res.status(404).json({ message: 'Room not found' });
      return;
    }

    // If owner leaves, delete the whole room
    if (room.owner.toString() === userId) {
      await Room.findByIdAndDelete(id);
      res.json({ message: 'Room deleted — you were the owner' });
      return;
    }

    // Otherwise just remove them from participants
    room.participants = room.participants.filter(
      (p) => p.toString() !== userId
    );
    await room.save();

    res.json({ message: 'Left room successfully' });
  } catch (error) {
    console.error('Leave room error:', error);
    res.status(500).json({ message: 'Failed to leave room' });
  }
};