import { useEffect, useRef, useCallback } from 'react';
import { useBoardStore } from '../store/boardStore';
import { saveBoard } from '../lib/boardApi';

interface UseAutoSaveOptions {
  roomId: string;
  intervalMs?: number;  // default 30 seconds
  onSaveStart?: () => void;
  onSaveComplete?: (savedAt: string) => void;
  onSaveError?: (err: Error) => void;
}

export const useAutoSave = ({
  roomId,
  intervalMs = 30_000,
  onSaveStart,
  onSaveComplete,
  onSaveError,
}: UseAutoSaveOptions) => {
  const isDirtyRef = useRef(false);
  const isSavingRef = useRef(false);
  const lastSavedStrokesRef = useRef(0);

  // Watch stroke count — mark dirty when it changes
  useEffect(() => {
    const unsubscribe = useBoardStore.subscribe((state) => {
      const count = state.strokes.length;
      if (count !== lastSavedStrokesRef.current) {
        isDirtyRef.current = true;
      }
    });
    return unsubscribe;
  }, []);

  const performSave = useCallback(async (): Promise<void> => {
    // Skip if nothing changed or a save is already in flight
    if (!isDirtyRef.current || isSavingRef.current) return;

    const { strokes } = useBoardStore.getState();

    // Nothing to save
    if (strokes.length === 0 && lastSavedStrokesRef.current === 0) return;

    isSavingRef.current = true;
    onSaveStart?.();

    try {
      const result = await saveBoard(roomId, strokes);
      isDirtyRef.current = false;
      lastSavedStrokesRef.current = strokes.length;
      onSaveComplete?.(result.savedAt);
    } catch (err) {
      console.error('Auto-save failed:', err);
      onSaveError?.(err as Error);
    } finally {
      isSavingRef.current = false;
    }
  }, [roomId, onSaveStart, onSaveComplete, onSaveError]);

  // Interval-based save
  useEffect(() => {
    if (!roomId) return;

    const interval = setInterval(performSave, intervalMs);
    return () => clearInterval(interval);
  }, [roomId, intervalMs, performSave]);

  // Save on page unload / tab close
  useEffect(() => {
    const handleBeforeUnload = () => {
        const { strokes } = useBoardStore.getState();
        if (isDirtyRef.current && strokes.length > 0) {
            const token = localStorage.getItem('token');
            const blob = new Blob(
            [JSON.stringify({ strokes })],
            { type: 'application/json' }
            );
            // Pass token as query param since sendBeacon can't set headers
            navigator.sendBeacon(
            `${import.meta.env.VITE_API_URL}/boards/${roomId}/beacon?token=${token}`,
            blob
            );
        }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [roomId]);

  // Expose manual save trigger (for the 💾 button)
  return { saveNow: performSave };
};