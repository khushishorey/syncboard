import { io, Socket } from 'socket.io-client';
import type { ClientToServerEvents, ServerToClientEvents } from '../types/socket';

const SOCKET_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
  SOCKET_URL,
  {
    autoConnect: false,
    // In production, start with polling then upgrade to WebSocket
    // This handles Render's cold start and proxy behaviour
    transports: ['polling', 'websocket'],
    auth: (cb) => {
      const token = localStorage.getItem('token');
      cb({ token });
    },
    // Reconnection config
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
  }
);