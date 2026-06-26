import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useRoomStore } from '../store/roomStore';
import RoomCard from '../components/RoomCard';
import CreateRoomModal from '../components/CreateRoomModal';
import JoinRoomModal from '../components/JoinRoomModal';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { rooms, fetchRooms, isLoading } = useRoomStore();
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Navbar */}
      <nav className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="text-white font-semibold">SyncBoard</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-slate-400 text-sm hidden sm:block">
              {user?.name}
            </span>
            <button
              onClick={handleLogout}
              className="text-slate-400 hover:text-white text-sm transition"
            >
              Sign out
            </button>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="max-w-5xl mx-auto px-6 py-10">
        {/* Header row */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Your rooms</h1>
            <p className="text-slate-400 text-sm mt-1">
              {rooms.length === 0
                ? 'No rooms yet — create one or join with an invite code'
                : `${rooms.length} room${rooms.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowJoin(true)}
              className="px-4 py-2 border border-slate-600 hover:border-slate-400 text-slate-300 hover:text-white text-sm font-medium rounded-lg transition"
            >
              Join room
            </button>
            <button
              onClick={() => setShowCreate(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition"
            >
              + Create room
            </button>
          </div>
        </div>

        {/* Rooms grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-slate-400">Loading rooms...</div>
          </div>
        ) : rooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mb-4">
              <span className="text-3xl">🎨</span>
            </div>
            <h2 className="text-white font-medium mb-2">No rooms yet</h2>
            <p className="text-slate-400 text-sm max-w-xs">
              Create a room to start collaborating, or join an existing one with an invite code.
            </p>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowJoin(true)}
                className="px-4 py-2 border border-slate-600 hover:border-slate-400 text-slate-300 text-sm rounded-lg transition"
              >
                Join with code
              </button>
              <button
                onClick={() => setShowCreate(true)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded-lg transition"
              >
                Create first room
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {rooms.map((room) => (
              <RoomCard key={room._id} room={room} />
            ))}
          </div>
        )}
      </main>

      {/* Modals */}
      {showCreate && (
        <CreateRoomModal
          onClose={() => setShowCreate(false)}
          onCreated={() => {}}
        />
      )}
      {showJoin && (
        <JoinRoomModal
          onClose={() => setShowJoin(false)}
          onJoined={() => {}}
        />
      )}
    </div>
  );
};

export default DashboardPage;