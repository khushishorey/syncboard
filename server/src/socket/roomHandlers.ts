import { Server } from 'socket.io';
import { AuthenticatedSocket } from './middleware';
import { sendBoardState } from './drawHandlers';

export const registerRoomHandlers = (
  io: Server,
  socket: AuthenticatedSocket
) => {
  const { userId, name } = socket.data;

  // CLIENT joins a room
  socket.on('join-room', async ({ roomId }) => {
    try {
      // Verify the user is actually a participant of this room
      const Room = (await import('../models/Room')).default;

      const room = await Room.findById(roomId);
      if (!room) {
        socket.emit('error' as any, { message: 'Room not found' });
        return;
      }

      const isMember = room.participants.some(
        (p) => p.toString() === userId
      );

      if (!isMember) {
        socket.emit('error' as any, { message: 'Not a room member' });
        return;
      }

      // Join the Socket.io room — this is the namespace all broadcasts use
      await socket.join(roomId);

      console.log(`${name} joined room ${roomId}`);

      // Tell everyone else this user joined
      socket.to(roomId).emit('user-joined', {
        userId,
        name,
        participants: [],
      });

      // Send the current board state ONLY to the joining socket
      // so late joiners see all existing strokes immediately
      await sendBoardState(socket, roomId);

    } catch (err) {
      console.error('join-room error:', err);
    }
  });

  // CLIENT explicitly leaves a room (e.g. clicks back button)
  socket.on('leave-room', ({ roomId }) => {
    socket.leave(roomId);
    io.to(roomId).emit('user-left', { userId, name });
    console.log(`${name} left room ${roomId}`);
  });

  // CLIENT moves their cursor
  socket.on('cursor-move', ({ roomId, x, y }) => {
    // Broadcast to everyone else in the room — not back to sender
    socket.to(roomId).emit('cursor-update', {
      userId,
      name,
      x,
      y,
      color: stringToColor(userId),
    });
  });

  // Handle disconnect (tab closed, network drop, etc.)
  socket.on('disconnect', () => {
    console.log(`${name} disconnected`);
    // Notify all rooms this socket was in
    socket.rooms.forEach((roomId) => {
      if (roomId !== socket.id) {
        io.to(roomId).emit('user-left', { userId, name });
      }
    });
  });
};

// Deterministically assign a color to each user based on their userId
// Same userId always gets the same color — consistent across sessions
const stringToColor = (str: string): string => {
  const colors = [
    '#f87171', '#fb923c', '#facc15',
    '#4ade80', '#60a5fa', '#a78bfa',
    '#f472b6', '#34d399', '#38bdf8',
  ];
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};