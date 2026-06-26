import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRoomStore } from '../store/roomStore';
import { useBoardStore } from '../store/boardStore';
import { useAuthStore } from '../store/authStore';
import Canvas from '../components/whiteboard/Canvas';
import Toolbar from '../components/whiteboard/Toolbar';
import BoardControls from '../components/whiteboard/BoardControls';
import useWindowSize from '../hooks/useWindowSize';

const WhiteboardPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { width, height } = useWindowSize();

  const { currentRoom, setCurrentRoom } = useRoomStore();
  const { clearBoard } = useBoardStore();
  const { user } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadRoom = async () => {
      if (!id) return;

      // If we already have the room in store (came from dashboard), use it
      if (currentRoom?._id === id) {
        setLoading(false);
        return;
      }

      // Otherwise fetch it
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

    // Clear board state when entering a room
    clearBoard();
  }, [id]);

  const handleLeave = () => {
    setCurrentRoom(null);
    clearBoard();
    navigate('/dashboard');
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
      {/* The canvas fills the entire viewport */}
      <Canvas width={width} height={height} />

      {/* Floating toolbar on the left */}
      <Toolbar />

      {/* Top bar with room name and controls */}
      <BoardControls
        roomName={currentRoom?.name || 'Whiteboard'}
        onLeave={handleLeave}
      />

      {/* Participants indicator — bottom right */}
      <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-slate-800/80 backdrop-blur-sm border border-slate-700 rounded-xl px-3 py-2">
        <div className="flex -space-x-2">
          {currentRoom?.participants.slice(0, 5).map((p) => (
            <div
              key={p._id}
              title={p.name}
              className="w-7 h-7 rounded-full bg-indigo-600 border-2 border-slate-800 flex items-center justify-center text-xs text-white font-medium"
            >
              {p.name.charAt(0).toUpperCase()}
            </div>
          ))}
        </div>
        <span className="text-slate-400 text-xs">
          {currentRoom?.participants.length ?? 1} online
        </span>
      </div>
    </div>
  );
};

export default WhiteboardPage;