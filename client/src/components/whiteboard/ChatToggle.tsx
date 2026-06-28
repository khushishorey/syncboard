import { useChatStore } from '../../store/chatStore';

const ChatToggle = () => {
  const { toggleChat, unreadCount } = useChatStore();

  return (
    <button
      onClick={toggleChat}
      title="Open chat"
      className="absolute bottom-4 right-4 z-20 w-11 h-11 rounded-2xl flex items-center justify-center transition shadow-lg"
      style={{
        backgroundColor: '#1e293b',
        border: '1px solid #334155',
      }}
    >
      {/* Chat bubble icon */}
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
        stroke="#94a3b8"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>

      {/* Unread badge */}
      {unreadCount > 0 && (
        <span className="absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1 rounded-full bg-indigo-500 text-white text-xs font-bold flex items-center justify-center animate-pulse">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </button>
  );
};

export default ChatToggle;