import { create } from 'zustand';
import type { Tool } from '../types';

interface ToolState {
  activeTool: Tool;
  activeColor: string;
  brushSize: number;
  setTool: (tool: Tool) => void;
  setColor: (color: string) => void;
  setBrushSize: (size: number) => void;
}

export const COLORS = [
  '#ffffff', // white
  '#f87171', // red
  '#fb923c', // orange
  '#facc15', // yellow
  '#4ade80', // green
  '#60a5fa', // blue
  '#a78bfa', // purple
  '#f472b6', // pink
  '#000000', // black
];

export const useToolStore = create<ToolState>((set) => ({
  activeTool: 'pencil',
  activeColor: '#ffffff',
  brushSize: 4,
  setTool: (tool) => set({ activeTool: tool }),
  setColor: (color) => set({ activeColor: color }),
  setBrushSize: (size) => set({ brushSize: size }),
}));