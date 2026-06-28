import type { Stroke } from './index';
import type { ChatMessage } from './index';

// Events the CLIENT emits to the server
export interface ClientToServerEvents {
  'join-room': (data: { roomId: string }) => void;
  'leave-room': (data: { roomId: string }) => void;
  'cursor-move': (data: { roomId: string; x: number; y: number }) => void;
  'draw': (data: { roomId: string; stroke: Stroke }) => void;
  'undo': (data: { roomId: string; strokeId: string }) => void;
  'redo': (data: { roomId: string; stroke: Stroke }) => void;
  'clear-board': (data: { roomId: string }) => void;
  'chat-message': (data: { roomId: string; content: string }) => void;
}

// Events the SERVER emits to clients
export interface ServerToClientEvents {
  'user-joined': (data: { userId: string; name: string; participants: string[] }) => void;
  'user-left': (data: { userId: string; name: string }) => void;
  'cursor-update': (data: { userId: string; name: string; x: number; y: number; color: string }) => void;
  'draw': (data: { stroke: Stroke; userId: string }) => void;
  'undo': (data: { strokeId: string; userId: string }) => void;
  'redo': (data: { stroke: Stroke; userId: string }) => void;
  'clear-board': (data: { userId: string }) => void;
  'board-state': (data: { strokes: Stroke[] }) => void;
  'chat-message': (data: ChatMessage) => void;
  'chat-history': (data: ChatMessage[]) => void;
}