import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRoomStore } from '../store/roomStore';
import { useBoardStore } from '../store/boardStore';
import { useChatStore } from '../store/chatStore';
import { useSocket } from '../hooks/useSocket';
import { useAutoSave } from '../hooks/useAutoSave';
import Canvas from '../components/whiteboard/Canvas';
import Toolbar from '../components/whiteboard/Toolbar';
import BoardControls from '../components/whiteboard/BoardControls';
import RemoteCursors from '../components/whiteboard/RemoteCursors';
import OnlineUsers from '../components/whiteboard/OnlineUsers';
import ChatPanel from '../components/whiteboard/ChatPanel';
import ChatToggle from '../components/whiteboard/ChatToggle';
import SaveStatus from '../components/whiteboard/SaveStatus';
import useWindowSize from '../hooks/useWindowSize';
import type { Stroke } from '../types';
import type { Status } from '../components/whiteboard/SaveStatus';

const WhiteboardPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { width, height } = useWindowSize();

  const { currentRoom, setCurrentRoom } = useRoomStore();
  const { clearBoard, undo, redo } = useBoardStore();
  const { isChatOpen } = useChatStore();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saveStatus, setSaveStatus] = useState<Status>('idle');
  const [savedAt, setSavedAt] = useState<string | null>(null);

  const {
    emitCursorMove,
    emitDraw,
    emitUndo,
    emitRedo,
    emitClearBoard,
    emitChatMessage,
  } = useSocket(id || '');

  // ── Auto-save ──────────────────────────────────────────────────
  const { saveNow } = useAutoSave({
    roomId: id || '',
    intervalMs: 30_000,
    onSaveStart: () => setSaveStatus('saving'),
    onSaveComplete: (at) => {
      setSaveStatus('saved');
      setSavedAt(at);
    },
    onSaveError: () => setSaveStatus('error'),
  });

  // ── Load room ──────────────────────────────────────────────────
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

  // ── Handlers ───────────────────────────────────────────────────
  const handleLeave = useCallback(async () => {
    // Save before leaving
    await saveNow();
    setCurrentRoom(null);
    clearBoard();
    navigate('/dashboard');
  }, [saveNow, setCurrentRoom, clearBoard, navigate]);

  const handleStrokeCommit = useCallback((stroke: Stroke) => {
    emitDraw(stroke);
  }, [emitDraw]);

  const handleUndo = useCallback(() => {
    const { undoStack } = useBoardStore.getState();
    if (undoStack.length === 0) return;
    const lastId = undoStack[undoStack.length - 1];
    undo();
    emitUndo(lastId);
  }, [undo, emitUndo]);

  const handleRedo = useCallback(() => {
    const { redoStack } = useBoardStore.getState();
    if (redoStack.length === 0) return;
    const stroke = redoStack[redoStack.length - 1];
    redo();
    emitRedo(stroke);
  }, [redo, emitRedo]);

  const handleClear = useCallback(() => {
    const confirmed = window.confirm('Clear the entire board for everyone?');
    if (!confirmed) return;
    clearBoard();
    emitClearBoard();
  }, [clearBoard, emitClearBoard]);

  // Manual save — triggers saveNow then exports PNG
  const handleSave = useCallback(async () => {
    // Persist to DB
    await saveNow();

    // Also export PNG
    const stage = document.querySelector('canvas');
    if (!stage) return;
    const link = document.createElement('a');
    link.download = `${currentRoom?.name || 'board'}-${Date.now()}.png`;
    link.href = stage.toDataURL('image/png');
    link.click();
  }, [saveNow, currentRoom]);

  // ── Render states ──────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-400 text-sm">Loading room...</p>
        </div>
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
      {/* Canvas */}
      <div style={{ width: isChatOpen ? `calc(100vw - 288px)` : '100vw', height: '100vh' }}>
        <Canvas
          width={isChatOpen ? width - 288 : width}
          height={height}
          onCursorMove={emitCursorMove}
          onStrokeCommit={handleStrokeCommit}
        />
      </div>

      <RemoteCursors />
      <Toolbar />

      <BoardControls
        roomName={currentRoom?.name || 'Whiteboard'}
        onLeave={handleLeave}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onClear={handleClear}
        onSave={handleSave}
      />

      {/* Save status pill — bottom center */}
      <SaveStatus status={saveStatus} savedAt={savedAt} />

      {/* Chat toggle — only when panel is closed */}
      {!isChatOpen && <ChatToggle />}

      {/* Online users */}
      <div
        className="absolute bottom-4 z-10"
        style={{
          right: isChatOpen ? '296px' : '60px',
          transition: 'right 0.2s ease',
        }}
      >
        <OnlineUsers />
      </div>

      {/* Chat panel */}
      {isChatOpen && (
        <ChatPanel onSendMessage={emitChatMessage} />
      )}
    </div>
  );
};

export default WhiteboardPage;