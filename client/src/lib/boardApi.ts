import { api } from './api';
import type { Stroke } from '../types';

// Save the full board state to the server
export const saveBoard = async (
  roomId: string,
  strokes: Stroke[]
): Promise<{ savedAt: string; strokeCount: number }> => {
  const { data } = await api.put(`/boards/${roomId}`, { strokes });
  return data;
};

// Load the board state from the server (used as fallback)
export const loadBoard = async (
  roomId: string
): Promise<{ strokes: Stroke[]; savedAt: string | null }> => {
  const { data } = await api.get(`/boards/${roomId}`);
  return data;
};