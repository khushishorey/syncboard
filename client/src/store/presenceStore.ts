import { create } from 'zustand';

export interface RemoteCursor {
  userId: string;
  name: string;
  x: number;
  y: number;
  color: string;
  lastSeen: number;
}

interface PresenceState {
  onlineUsers: Map<string, { userId: string; name: string }>;
  cursors: Map<string, RemoteCursor>;
  addUser: (userId: string, name: string) => void;
  removeUser: (userId: string) => void;
  updateCursor: (cursor: RemoteCursor) => void;
  removeCursor: (userId: string) => void;
  clearPresence: () => void;
}

export const usePresenceStore = create<PresenceState>((set) => ({
  onlineUsers: new Map(),
  cursors: new Map(),

  addUser: (userId, name) =>
    set((state) => {
      const next = new Map(state.onlineUsers);
      next.set(userId, { userId, name });
      return { onlineUsers: next };
    }),

  removeUser: (userId) =>
    set((state) => {
      const nextUsers = new Map(state.onlineUsers);
      const nextCursors = new Map(state.cursors);
      nextUsers.delete(userId);
      nextCursors.delete(userId);
      return { onlineUsers: nextUsers, cursors: nextCursors };
    }),

  updateCursor: (cursor) =>
    set((state) => {
      const next = new Map(state.cursors);
      next.set(cursor.userId, { ...cursor, lastSeen: Date.now() });
      return { cursors: next };
    }),

  removeCursor: (userId) =>
    set((state) => {
      const next = new Map(state.cursors);
      next.delete(userId);
      return { cursors: next };
    }),

  clearPresence: () =>
    set({ onlineUsers: new Map(), cursors: new Map() }),
}));