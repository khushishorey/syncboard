import { useNavigate } from 'react-router-dom';
import type { Room } from '../types';
import { useAuthStore } from '../store/authStore';
import { useRoomStore } from '../store/roomStore';

interface Props {
  room: Room;
}

const RoomCard = ({ room }: Props) => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { leaveRoom } = useRoomStore();
  const isOwner = room.owner._id === user?.id;

  const handleEnter = () => {
    navigate(`/room/${room._id}`);
  };

  const handleLeave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const confirmed = window.confirm(
      isOwner
        ? 'You are the owner. Leaving will delete this room for everyone. Continue?'
        : 'Leave this room?'
    );
    if (!confirmed) return;
    await leaveRoom(room._id);
  };

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 flex flex-col gap-4 hover:border-slate-500 transition">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-white font-semibold text-lg truncate">{room.name}</h3>
          <p className="text-slate-400 text-sm mt-0.5">
            {isOwner ? 'You own this room' : `Owned by ${room.owner.name}`}
          </p>
        </div>
        <span className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded-md font-mono">
          {room.inviteCode}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex -space-x-2">
          {room.participants.slice(0, 4).map((p) => (
            <div
              key={p._id}
              className="w-7 h-7 rounded-full bg-indigo-600 border-2 border-slate-800 flex items-center justify-center text-xs text-white font-medium"
              title={p.name}
            >
              {p.name.charAt(0).toUpperCase()}
            </div>
          ))}
        </div>
        <span className="text-slate-400 text-xs">
          {room.participants.length} participant{room.participants.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="flex gap-2 mt-auto">
        <button
          onClick={handleEnter}
          className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition"
        >
          Enter room
        </button>
        <button
          onClick={handleLeave}
          className="px-3 py-2 bg-slate-700 hover:bg-red-500/20 hover:text-red-400 text-slate-300 text-sm rounded-lg transition"
        >
          {isOwner ? 'Delete' : 'Leave'}
        </button>
      </div>
    </div>
  );
};

export default RoomCard;