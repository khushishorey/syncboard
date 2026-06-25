export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Point {
  x: number;
  y: number;
}

export interface Stroke {
  id: string;
  userId: string;
  tool: 'pencil' | 'eraser';
  color: string;
  brushSize: number;
  points: Point[];
  timestamp: number;
}

export interface Room {
  id: string;
  name: string;
  inviteCode: string;
  owner: string;
  participants: User[];
}

export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: number;
}

export type Tool = 'pencil' | 'eraser';