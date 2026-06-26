import { io, Socket } from 'socket.io-client';
import type { ClientToServerEvents, ServerToClientEvents } from '../types/socket';

const SOCKET_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
  SOCKET_URL,
  {
    autoConnect: false,
    // JWT sent in the handshake so the server can authenticate
    // before any event is processed
    auth: (cb) => {
      const token = localStorage.getItem('token');
      cb({ token });
    },
  }
);