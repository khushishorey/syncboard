import { usePresenceStore } from '../../store/presenceStore';
import { useAuthStore } from '../../store/authStore';

const stringToColor = (str: string): string => {
  const colors = [
    '#f87171', '#fb923c', '#facc15',
    '#4ade80', '#60a5fa', '#a78bfa',
    '#f472b6', '#34d399', '#38bdf8',
  ];
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

const OnlineUsers = () => {
  const { onlineUsers } = usePresenceStore();
  const { user } = useAuthStore();

  const others = Array.from(onlineUsers.values()).filter(
    (u) => u.userId !== user?.id
  );

  return (
    <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-slate-800/80 backdrop-blur-sm border border-slate-700 rounded-xl px-3 py-2 z-10">
      <div className="flex -space-x-2">
        {/* Current user always shown first */}
        <div
          title={`${user?.name} (you)`}
          className="w-7 h-7 rounded-full border-2 border-slate-800 flex items-center justify-center text-xs text-white font-medium"
          style={{ backgroundColor: stringToColor(user?.id || '') }}
        >
          {user?.name.charAt(0).toUpperCase()}
        </div>
        {others.slice(0, 4).map((u) => (
          <div
            key={u.userId}
            title={u.name}
            className="w-7 h-7 rounded-full border-2 border-slate-800 flex items-center justify-center text-xs text-white font-medium"
            style={{ backgroundColor: stringToColor(u.userId) }}
          >
            {u.name.charAt(0).toUpperCase()}
          </div>
        ))}
      </div>
      <span className="text-slate-400 text-xs">
        {1 + others.length} online
      </span>
    </div>
  );
};

export default OnlineUsers;