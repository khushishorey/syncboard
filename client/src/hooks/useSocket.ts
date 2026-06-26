import { useEffect, useRef } from 'react';
import { socket } from '../lib/socket';
import { useAuthStore } from '../store/authStore';
import { usePresenceStore } from '../store/presenceStore';
import { useBoardStore } from '../store/boardStore';

export const useSocket = (roomId: string) => {
  const { user } = useAuthStore();
  const {
    addUser,
    removeUser,
    updateCursor,
    clearPresence,
  } = usePresenceStore();
  const { addRemoteStroke, removeStroke, clearBoard, setStrokes } =
    useBoardStore();

  const roomIdRef = useRef(roomId);
  roomIdRef.current = roomId;

  useEffect(() => {
    if (!roomId || !user) return;

    // ── Connect and authenticate ──────────────────────────────
    socket.connect();

    // ── Join the socket room once connected ───────────────────
    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
      socket.emit('join-room', { roomId });
    });

    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
    });

    // ── Presence events ───────────────────────────────────────
    socket.on('user-joined', ({ userId, name }) => {
      addUser(userId, name);
    });

    socket.on('user-left', ({ userId, name }) => {
      removeUser(userId);
      console.log(`${name} left the room`);
    });

    // ── Cursor events ─────────────────────────────────────────
    socket.on('cursor-update', (data) => {
      updateCursor({ ...data, lastSeen: Date.now() });
    });

    // ── Drawing events (handlers ready for Milestone 6) ───────
    socket.on('draw', ({ stroke }) => {
      addRemoteStroke(stroke);
    });

    socket.on('undo', ({ strokeId }) => {
      removeStroke(strokeId);
    });

    socket.on('redo', ({ stroke }) => {
      addRemoteStroke(stroke);
    });

    socket.on('clear-board', () => {
      clearBoard();
    });

    socket.on('board-state', ({ strokes }) => {
      setStrokes(strokes);
    });

    // ── Cleanup on unmount ────────────────────────────────────
    return () => {
      socket.emit('leave-room', { roomId });
      socket.off('connect');
      socket.off('connect_error');
      socket.off('user-joined');
      socket.off('user-left');
      socket.off('cursor-update');
      socket.off('draw');
      socket.off('undo');
      socket.off('redo');
      socket.off('clear-board');
      socket.off('board-state');
      socket.disconnect();
      clearPresence();
    };
  }, [roomId, user]);

  // Expose a throttled cursor emitter for the canvas to call
  const emitCursorMove = (x: number, y: number) => {
    if (socket.connected) {
      socket.emit('cursor-move', { roomId, x, y });
    }
  };

  const emitDraw = (stroke: import('../types').Stroke) => {
    if (socket.connected) {
      socket.emit('draw', { roomId, stroke });
    }
  };

  const emitUndo = (strokeId: string) => {
    if (socket.connected) {
      socket.emit('undo', { roomId, strokeId });
    }
  };

  const emitRedo = (stroke: import('../types').Stroke) => {
    if (socket.connected) {
      socket.emit('redo', { roomId, stroke });
    }
  };

  const emitClearBoard = () => {
    if (socket.connected) {
      socket.emit('clear-board', { roomId });
    }
  };

  return { emitCursorMove, emitDraw, emitUndo, emitRedo, emitClearBoard };
};