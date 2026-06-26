import { Server } from 'socket.io';
import { socketAuthMiddleware, AuthenticatedSocket } from './middleware';
import { registerRoomHandlers } from './roomHandlers';
import { registerDrawHandlers } from './drawHandlers';

export const initializeSocket = (io: Server): void => {
  // Apply auth middleware to every connection
  io.use((socket, next) =>
    socketAuthMiddleware(socket as AuthenticatedSocket, next)
  );

  io.on('connection', (socket) => {
    const authSocket = socket as AuthenticatedSocket;
    console.log(`Authenticated socket: ${authSocket.data.name} (${socket.id})`);

    // Register all room-related event handlers
    registerRoomHandlers(io, authSocket);
    registerDrawHandlers(io, authSocket);
  });
};