import { Server } from 'socket.io';
import { AuthenticatedSocket } from './middleware';
import Message from '../models/Message';

export const registerChatHandlers = (
  io: Server,
  socket: AuthenticatedSocket
): void => {
  const { userId, name } = socket.data;

  // ── chat-message ───────────────────────────────────────────────
  socket.on('chat-message', async ({ roomId, content }) => {
    try {
      if (!content || !content.trim()) return;

      // Truncate just in case client sends too long a message
      const trimmed = content.trim().slice(0, 1000);

      // Persist to DB
      const message = await Message.create({
        roomId,
        userId,
        userName: name,
        content: trimmed,
      });

      const payload = {
        id: message._id.toString(),
        userId,
        userName: name,
        content: trimmed,
        timestamp: message.createdAt.getTime(),
      };

      // Broadcast to EVERYONE in the room including sender
      // so the sender's message appears in their own panel too
      io.to(roomId).emit('chat-message', payload);

    } catch (err) {
      console.error('chat-message error:', err);
    }
  });
};

// Called from roomHandlers on join — sends last 50 messages to the joiner
export const sendChatHistory = async (
  socket: AuthenticatedSocket,
  roomId: string
): Promise<void> => {
  try {
    const messages = await Message.find({ roomId })
      .sort({ createdAt: 1 })
      .limit(50)
      .lean();

    const history = messages.map((m) => ({
      id: m._id.toString(),
      userId: m.userId,
      userName: m.userName,
      content: m.content,
      timestamp: new Date(m.createdAt).getTime(),
    }));

    socket.emit('chat-history', history);
  } catch (err) {
    console.error('sendChatHistory error:', err);
  }
};