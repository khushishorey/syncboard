import { create } from 'zustand';
import type { Stroke, Point } from '../types';

interface BoardState {
  // All committed strokes — the full drawing history
  strokes: Stroke[];

  // The stroke currently being drawn (not yet committed)
  currentStroke: Stroke | null;

  // Stack of stroke IDs for undo (most recent last)
  undoStack: string[];

  // Full stroke objects removed by undo, available to redo
  redoStack: Stroke[];

  // Actions
  startStroke: (stroke: Stroke) => void;
  appendPoint: (point: Point) => void;
  commitStroke: () => void;
  undo: () => void;
  redo: () => void;
  clearBoard: () => void;

  // Used in Milestone 6 — receives remote strokes from other users
  addRemoteStroke: (stroke: Stroke) => void;
  removeStroke: (strokeId: string) => void;
  setStrokes: (strokes: Stroke[]) => void;
}

export const useBoardStore = create<BoardState>((set, get) => ({
  strokes: [],
  currentStroke: null,
  undoStack: [],
  redoStack: [],

  startStroke: (stroke) => {
    set({
      currentStroke: stroke,
      // Any new drawing clears the redo stack
      redoStack: [],
    });
  },

  appendPoint: (point) => {
    const { currentStroke } = get();
    if (!currentStroke) return;
    set({
      currentStroke: {
        ...currentStroke,
        points: [...currentStroke.points, point],
      },
    });
  },

  commitStroke: () => {
    const { currentStroke, strokes, undoStack } = get();
    if (!currentStroke || currentStroke.points.length < 2) {
      // Discard single-point strokes (accidental clicks)
      set({ currentStroke: null });
      return;
    }
    set({
      strokes: [...strokes, currentStroke],
      undoStack: [...undoStack, currentStroke.id],
      currentStroke: null,
    });
  },

  undo: () => {
    const { undoStack, strokes, redoStack } = get();
    if (undoStack.length === 0) return;

    const lastId = undoStack[undoStack.length - 1];
    const lastStroke = strokes.find((s) => s.id === lastId);
    if (!lastStroke) return;

    set({
      strokes: strokes.filter((s) => s.id !== lastId),
      undoStack: undoStack.slice(0, -1),
      redoStack: [...redoStack, lastStroke],
    });
  },

  redo: () => {
    const { redoStack, strokes, undoStack } = get();
    if (redoStack.length === 0) return;

    const stroke = redoStack[redoStack.length - 1];
    set({
      strokes: [...strokes, stroke],
      undoStack: [...undoStack, stroke.id],
      redoStack: redoStack.slice(0, -1),
    });
  },

  clearBoard: () => {
    set({ strokes: [], currentStroke: null, undoStack: [], redoStack: [] });
  },

  // These three are used in Milestone 6 for real-time sync
  addRemoteStroke: (stroke) => {
    set((state) => ({ strokes: [...state.strokes, stroke] }));
  },

  removeStroke: (strokeId) => {
    set((state) => ({
      strokes: state.strokes.filter((s) => s.id !== strokeId),
    }));
  },

  setStrokes: (strokes) => {
    set({ strokes, currentStroke: null, undoStack: [], redoStack: [] });
  },
}));