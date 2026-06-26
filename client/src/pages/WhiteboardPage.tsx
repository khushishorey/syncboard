import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRoomStore } from '../store/roomStore';
import { useBoardStore } from '../store/boardStore';
import { useAuthStore } from '../store/authStore';
import { useSocket } from '../hooks/useSocket';
import Canvas from '../components/whiteboard/Canvas';
import Toolbar from '../components/whiteboard/Toolbar';
import BoardControls from '../components/whiteboard/BoardControls';
import RemoteCursors from '../components/whiteboard/RemoteCursors';
import OnlineUsers from '../components/whiteboard/OnlineUsers';
import useWindowSize from '../hooks/useWindowSize';
import type { Stroke } from '../types';

const WhiteboardPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { width, height } = useWindowSize();

  const { currentRoom, setCurrentRoom } = useRoomStore();
  const { clearBoard, undo, redo } = useBoardStore();
  const { user } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // All socket logic lives here
  const { emitCursorMove, emitDraw, emitUndo, emitRedo, emitClearBoard } =
    useSocket(id || '');

  useEffect(() => {
    const loadRoom = async () => {
      if (!id) return;
      if (currentRoom?._id === id) {
        setLoading(false);
        return;
      }
      try {
        const { api } = await import('../lib/api');
        const { data } = await api.get(`/rooms/${id}`);
        setCurrentRoom(data.room);
      } catch {
        setError('Room not found or you do not have access.');
      } finally {
        setLoading(false);
      }
    };

    loadRoom();
    clearBoard();
  }, [id]);

  const handleLeave = () => {
    setCurrentRoom(null);
    clearBoard();
    navigate('/dashboard');
  };

  // Called by Canvas when a stroke is committed
  const handleStrokeCommit = (stroke: Stroke) => {
    emitDraw(stroke);
  };

  // Undo with socket sync
  const handleUndo = () => {
    const { undoStack } = useBoardStore.getState();
    if (undoStack.length === 0) return;
    const lastId = undoStack[undoStack.length - 1];
    undo();
    emitUndo(lastId);
  };

  // Redo with socket sync
  const handleRedo = () => {
    const { redoStack } = useBoardStore.getState();
    if (redoStack.length === 0) return;
    const stroke = redoStack[redoStack.length - 1];
    redo();
    emitRedo(stroke);
  };

  // Clear with socket sync
  const handleClear = () => {
    const confirmed = window.confirm('Clear the entire board for everyone?');
    if (!confirmed) return;
    clearBoard();
    emitClearBoard();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <p className="text-slate-400">Loading room...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4">
        <p className="text-red-400">{error}</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="px-4 py-2 bg-slate-700 text-white rounded-lg text-sm"
        >
          Back to dashboard
        </button>
      </div>
    );
  }

  return (
    <div
      className="relative overflow-hidden"
      style={{ width: '100vw', height: '100vh', background: '#0f172a' }}
    >
      {/* Full-viewport canvas */}
      <Canvas
        width={width}
        height={height}
        onCursorMove={emitCursorMove}
        onStrokeCommit={handleStrokeCommit}
      />

      {/* Remote cursors float above canvas */}
      <RemoteCursors />

      {/* Floating toolbar */}
      <Toolbar />

      {/* Top controls bar */}
      <BoardControls
        roomName={currentRoom?.name || 'Whiteboard'}
        onLeave={handleLeave}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onClear={handleClear}
      />

      {/* Online users — bottom right */}
      <OnlineUsers />
    </div>
  );
};

export default WhiteboardPage;