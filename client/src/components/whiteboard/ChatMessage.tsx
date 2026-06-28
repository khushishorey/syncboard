import type { ChatMessage as ChatMessageType } from '../../types';
import { useAuthStore } from '../../store/authStore';

interface Props {
  message: ChatMessageType;
}

// Deterministic color per userId — same as server
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

const formatTime = (timestamp: number): string => {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
};

const ChatMessageBubble = ({ message }: Props) => {
  const { user } = useAuthStore();
  const isOwn = message.userId === user?.id;
  const color = stringToColor(message.userId);

  if (isOwn) {
    return (
      <div className="flex flex-col items-end gap-1 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-slate-500 text-xs">{formatTime(message.timestamp)}</span>
          <span className="text-xs font-medium" style={{ color }}>You</span>
        </div>
        <div className="max-w-[85%] px-3 py-2 rounded-2xl rounded-tr-sm text-sm text-white"
          style={{ backgroundColor: color + '33', border: `1px solid ${color}55` }}>
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start gap-1 mb-3">
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium" style={{ color }}>{message.userName}</span>
        <span className="text-slate-500 text-xs">{formatTime(message.timestamp)}</span>
      </div>
      <div className="max-w-[85%] px-3 py-2 rounded-2xl rounded-tl-sm bg-slate-700 text-sm text-white">
        {message.content}
      </div>
    </div>
  );
};

export default ChatMessageBubble;