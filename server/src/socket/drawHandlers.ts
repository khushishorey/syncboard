import { Server } from 'socket.io';
import { AuthenticatedSocket } from './middleware';
import {
  addStrokeToBoard,
  removeStrokeFromBoard,
  reAddStrokeToBoard,
  clearBoardInDB,
  getBoardStrokes,
  getOrCreateBoard,
} from './boardService';

export const registerDrawHandlers = (
  io: Server,
  socket: AuthenticatedSocket
): void => {
  const { userId, name } = socket.data;

  // ── draw ──────────────────────────────────────────────────────
  // Client committed a stroke locally — persist it and tell others
  socket.on('draw', async ({ roomId, stroke }) => {
    try {
      // Save to DB (fire-and-forget — don't await in hot path)
      addStrokeToBoard(roomId, stroke).catch((err) =>
        console.error('draw persist error:', err)
      );

      // Broadcast to everyone else in the room
      // socket.to() excludes the sender — they already rendered it locally
      socket.to(roomId).emit('draw', { stroke, userId });
    } catch (err) {
      console.error('draw handler error:', err);
    }
  });

  // ── undo ──────────────────────────────────────────────────────
  socket.on('undo', async ({ roomId, strokeId }) => {
    try {
      removeStrokeFromBoard(roomId, strokeId).catch((err) =>
        console.error('undo persist error:', err)
      );

      socket.to(roomId).emit('undo', { strokeId, userId });
    } catch (err) {
      console.error('undo handler error:', err);
    }
  });

  // ── redo ──────────────────────────────────────────────────────
  socket.on('redo', async ({ roomId, stroke }) => {
    try {
      reAddStrokeToBoard(roomId, stroke).catch((err) =>
        console.error('redo persist error:', err)
      );

      socket.to(roomId).emit('redo', { stroke, userId });
    } catch (err) {
      console.error('redo handler error:', err);
    }
  });

  // ── clear-board ───────────────────────────────────────────────
  socket.on('clear-board', async ({ roomId }) => {
    try {
      clearBoardInDB(roomId).catch((err) =>
        console.error('clear persist error:', err)
      );

      // Broadcast to everyone INCLUDING sender's other tabs
      io.to(roomId).emit('clear-board', { userId });
    } catch (err) {
      console.error('clear-board handler error:', err);
    }
  });
};

// Called from roomHandlers when a user joins —
// sends the current board state to just that socket
export const sendBoardState = async (
  socket: AuthenticatedSocket,
  roomId: string
): Promise<void> => {
  try {
    const strokes = await getBoardStrokes(roomId);
    socket.emit('board-state', { strokes });
  } catch (err) {
    console.error('sendBoardState error:', err);
  }
};