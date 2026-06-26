import { usePresenceStore } from '../../store/presenceStore';
import { useAuthStore } from '../../store/authStore';

const RemoteCursors = () => {
  const { cursors } = usePresenceStore();
  const { user } = useAuthStore();

  return (
    <>
      {Array.from(cursors.values())
        // Never render our own cursor
        .filter((c) => c.userId !== user?.id)
        .map((cursor) => (
          <div
            key={cursor.userId}
            className="pointer-events-none absolute z-20 transition-transform duration-75"
            style={{
              left: cursor.x,
              top: cursor.y,
              transform: 'translate(-2px, -2px)',
            }}
          >
            {/* Cursor dot */}
            <div
              className="w-3 h-3 rounded-full border-2 border-white"
              style={{ backgroundColor: cursor.color }}
            />
            {/* Username label */}
            <div
              className="mt-1 px-2 py-0.5 rounded-md text-white text-xs font-medium whitespace-nowrap shadow-lg"
              style={{ backgroundColor: cursor.color }}
            >
              {cursor.name}
            </div>
          </div>
        ))}
    </>
  );
};

export default RemoteCursors;