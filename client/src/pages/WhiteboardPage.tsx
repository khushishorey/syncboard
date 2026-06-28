import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRoomStore } from '../store/roomStore';
import { useBoardStore } from '../store/boardStore';
import { useAuthStore } from '../store/authStore';
import { useChatStore } from '../store/chatStore';
import { useSocket } from '../hooks/useSocket';
import Canvas from '../components/whiteboard/Canvas';
import Toolbar from '../components/whiteboard/Toolbar';
import BoardControls from '../components/whiteboard/BoardControls';
import RemoteCursors from '../components/whiteboard/RemoteCursors';
import OnlineUsers from '../components/whiteboard/OnlineUsers';
import ChatPanel from '../components/whiteboard/ChatPanel';
import ChatToggle from '../components/whiteboard/ChatToggle';
import useWindowSize from '../hooks/useWindowSize';
import type { Stroke } from '../types';

const WhiteboardPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { width, height } = useWindowSize();

  const { currentRoom, setCurrentRoom } = useRoomStore();
  const { clearBoard, undo, redo } = useBoardStore();
  const { isChatOpen } = useChatStore();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const {
    emitCursorMove,
    emitDraw,
    emitUndo,
    emitRedo,
    emitClearBoard,
    emitChatMessage,
  } = useSocket(id || '');

  useEffect(() => {
    const loadRoom = async () => {
      if (!id) return;
      if (currentRoom?._id === id) { setLoading(false); return; }
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

  const handleStrokeCommit = (stroke: Stroke) => {
    emitDraw(stroke);
  };

  const handleUndo = () => {
    const { undoStack } = useBoardStore.getState();
    if (undoStack.length === 0) return;
    const lastId = undoStack[undoStack.length - 1];
    undo();
    emitUndo(lastId);
  };

  const handleRedo = () => {
    const { redoStack } = useBoardStore.getState();
    if (redoStack.length === 0) return;
    const stroke = redoStack[redoStack.length - 1];
    redo();
    emitRedo(stroke);
  };

  const handleClear = () => {
    const confirmed = window.confirm('Clear the entire board for everyone?');
    if (!confirmed) return;
    clearBoard();
    emitClearBoard();
  };

  const handleSave = () => {
    const stage = document.querySelector('canvas');
    if (!stage) return;
    const link = document.createElement('a');
    link.download = `${currentRoom?.name || 'board'}-${Date.now()}.png`;
    link.href = stage.toDataURL('image/png');
    link.click();
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
        <button onClick={() => navigate('/dashboard')}
          className="px-4 py-2 bg-slate-700 text-white rounded-lg text-sm">
          Back to dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden"
      style={{ width: '100vw', height: '100vh', background: '#0f172a' }}>

      {/* Canvas shrinks horizontally when chat is open */}
      <div style={{ width: isChatOpen ? `calc(100vw - 288px)` : '100vw', height: '100vh' }}>
        <Canvas
          width={isChatOpen ? width - 288 : width}
          height={height}
          onCursorMove={emitCursorMove}
          onStrokeCommit={handleStrokeCommit}
        />
      </div>

      {/* Remote cursors — above canvas */}
      <RemoteCursors />

      {/* Left toolbar */}
      <Toolbar />

      {/* Top controls */}
      <BoardControls
        roomName={currentRoom?.name || 'Whiteboard'}
        onLeave={handleLeave}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onClear={handleClear}
        onSave={handleSave}
      />

      {/* Chat toggle button — bottom right */}
      <ChatToggle />

      {/* Online users — bottom right (shifts left when chat open) */}
      <div className="absolute bottom-4 z-10"
        style={{ right: isChatOpen ? '308px' : '64px', transition: 'right 0.2s ease' }}>
        <OnlineUsers />
      </div>

      {/* Chat panel — slides in from right */}
      {isChatOpen && (
        <ChatPanel onSendMessage={emitChatMessage} />
      )}
    </div>
  );
};

export default WhiteboardPage;