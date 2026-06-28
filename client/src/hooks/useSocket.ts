import { useEffect, useRef } from 'react';
import { socket } from '../lib/socket';
import { useAuthStore } from '../store/authStore';
import { usePresenceStore } from '../store/presenceStore';
import { useBoardStore } from '../store/boardStore';
import { useChatStore } from '../store/chatStore';
import type { Stroke } from '../types';

export const useSocket = (roomId: string) => {
  const { user } = useAuthStore();
  const { addUser, removeUser, updateCursor, clearPresence } = usePresenceStore();
  const { addRemoteStroke, removeStroke, clearBoard, setStrokes } = useBoardStore();
  const { addMessage, setHistory, clearChat } = useChatStore();

  const roomIdRef = useRef(roomId);
  roomIdRef.current = roomId;

  useEffect(() => {
    if (!roomId || !user) return;

    socket.connect();

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
      socket.emit('join-room', { roomId });
    });

    socket.io.on('reconnect', () => {
      console.log('Socket reconnected — rejoining room');
      socket.emit('join-room', { roomId });
    });

    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
    });

    // ── Presence ───────────────────────────────────────────────
    socket.on('user-joined', ({ userId, name }) => {
      addUser(userId, name);
    });

    socket.on('user-left', ({ userId, name }) => {
      removeUser(userId);
      console.log(`${name} left the room`);
    });

    // ── Cursors ────────────────────────────────────────────────
    socket.on('cursor-update', (data) => {
      updateCursor({ ...data, lastSeen: Date.now() });
    });

    // ── Drawing ────────────────────────────────────────────────
    socket.on('draw', ({ stroke }) => {
      addRemoteStroke(stroke);
    });

    socket.on('undo', ({ strokeId }) => {
      removeStroke(strokeId);
    });

    socket.on('redo', ({ stroke }) => {
      addRemoteStroke(stroke);
    });

    // clear-board uses io.to() so it fires for EVERYONE including sender
    // WhiteboardPage calls clearBoard() locally first then emits
    // so we only respond to this if it came from someone else
    socket.on('clear-board', ({ userId: senderId }) => {
      if (senderId !== user.id) {
        clearBoard();
      }
    });

    // ── Board state — sent to late joiners on join ─────────────
    socket.on('board-state', ({ strokes }) => {
      setStrokes(strokes);
    });

    // ── Chat ───────────────────────────────────────────────────
    socket.on('chat-history', (messages) => {
      setHistory(messages);
    });

    socket.on('chat-message', (message) => {
      addMessage(message);
    });

    // ── Cleanup ────────────────────────────────────────────────
    return () => {
      socket.emit('leave-room', { roomId });
      socket.off('connect');
      socket.io.off('reconnect');
      socket.off('connect_error');
      socket.off('user-joined');
      socket.off('user-left');
      socket.off('cursor-update');
      socket.off('draw');
      socket.off('undo');
      socket.off('redo');
      socket.off('clear-board');
      socket.off('board-state');
      socket.off('chat-history');
      socket.off('chat-message');
      socket.disconnect();
      clearPresence();
      clearChat();
    };
  }, [roomId, user]);

  // ── Emitters ───────────────────────────────────────────────────

  const emitCursorMove = (x: number, y: number) => {
    if (socket.connected) socket.emit('cursor-move', { roomId, x, y });
  };

  const emitDraw = (stroke: Stroke) => {
    if (socket.connected) socket.emit('draw', { roomId, stroke });
  };

  const emitUndo = (strokeId: string) => {
    if (socket.connected) socket.emit('undo', { roomId, strokeId });
  };

  const emitRedo = (stroke: Stroke) => {
    if (socket.connected) socket.emit('redo', { roomId, stroke });
  };

  const emitClearBoard = () => {
    if (socket.connected) socket.emit('clear-board', { roomId });
  };

  const emitChatMessage = (content: string) => {
    if (socket.connected && content.trim()) {
      socket.emit('chat-message', { roomId, content: content.trim() });
    }
  };

  return {
    emitCursorMove,
    emitDraw,
    emitUndo,
    emitRedo,
    emitClearBoard,
    emitChatMessage,
  };
};