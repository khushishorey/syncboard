import { Socket } from 'socket.io';
import { verifyToken } from '../config/jwt';

export interface AuthenticatedSocket extends Socket {
  data: {
    userId: string;
    email: string;
    name: string;
  };
}

// Runs before any event handler — rejects unauthenticated sockets immediately
export const socketAuthMiddleware = async (
  socket: AuthenticatedSocket,
  next: (err?: Error) => void
) => {
  try {
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next(new Error('Authentication required'));
    }

    const decoded = verifyToken(token);

    // Fetch the user's name from DB so we can attach it to presence events
    const User = (await import('../models/User')).default;
    const user = await User.findById(decoded.userId).select('name');

    if (!user) {
      return next(new Error('User not found'));
    }

    // Attach to socket.data — accessible in all event handlers
    socket.data.userId = decoded.userId;
    socket.data.email = decoded.email;
    socket.data.name = user.name;

    next();
  } catch {
    next(new Error('Invalid token'));
  }
};