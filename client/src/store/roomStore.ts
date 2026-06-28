import { create } from 'zustand';
import type { Room } from '../types';
import { api } from '../lib/api';

interface RoomState {
  rooms: Room[];
  currentRoom: Room | null;
  isLoading: boolean;
  error: string | null;
  fetchRooms: () => Promise<void>;
  createRoom: (name: string) => Promise<Room>;
  joinRoom: (inviteCode: string) => Promise<Room>;
  leaveRoom: (roomId: string) => Promise<void>;
  setCurrentRoom: (room: Room | null) => void;
  clearError: () => void;
}

export const useRoomStore = create<RoomState>((set, _get) => ({  // The underscore prefix (infront of get)
  rooms: [],                                      //  tells TypeScript "I know this is unused, that's intentional."      
  currentRoom: null,
  isLoading: false,
  error: null,

  fetchRooms: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get('/rooms');
      set({ rooms: data.rooms, isLoading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to fetch rooms', isLoading: false });
    }
  },

  createRoom: async (name: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post('/rooms', { name });
      set((state) => ({
        rooms: [data.room, ...state.rooms],
        isLoading: false,
      }));
      return data.room;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to create room';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  joinRoom: async (inviteCode: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post('/rooms/join', { inviteCode });
      set((state) => {
        // avoid duplicates if user is already in room list
        const exists = state.rooms.some((r) => r._id === data.room._id);
        return {
          rooms: exists ? state.rooms : [data.room, ...state.rooms],
          isLoading: false,
        };
      });
      return data.room;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to join room';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  leaveRoom: async (roomId: string) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/rooms/${roomId}/leave`);
      set((state) => ({
        rooms: state.rooms.filter((r) => r._id !== roomId),
        isLoading: false,
      }));
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to leave room';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  setCurrentRoom: (room) => set({ currentRoom: room }),
  clearError: () => set({ error: null }),
}));