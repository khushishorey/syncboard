import { create } from 'zustand';
import type { ChatMessage } from '../types';

interface ChatState {
  messages: ChatMessage[];
  unreadCount: number;
  isChatOpen: boolean;
  addMessage: (message: ChatMessage) => void;
  setHistory: (messages: ChatMessage[]) => void;
  markAllRead: () => void;
  toggleChat: () => void;
  openChat: () => void;
  clearChat: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  unreadCount: 0,
  isChatOpen: false,

  addMessage: (message) => {
    const { isChatOpen } = get();
    set((state) => ({
      messages: [...state.messages, message],
      // Only increment unread if the panel is closed
      unreadCount: isChatOpen ? 0 : state.unreadCount + 1,
    }));
  },

  setHistory: (messages) => {
    set({ messages, unreadCount: 0 });
  },

  markAllRead: () => set({ unreadCount: 0 }),

  toggleChat: () => {
    const { isChatOpen } = get();
    set({ isChatOpen: !isChatOpen, unreadCount: 0 });
  },

  openChat: () => set({ isChatOpen: true, unreadCount: 0 }),

  clearChat: () => set({ messages: [], unreadCount: 0, isChatOpen: false }),
}));