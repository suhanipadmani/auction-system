import { Server as HttpServer } from "http";
import { Server } from "socket.io";
import { env } from "../config";
import { registerSocketHandlers } from "../app/sockets";
import { socketAuthMiddleware } from "../app/middleware/socket.middleware";
import { SocketService } from "../app/services/socket.service";

export const socketLoader = (server: HttpServer) => {
  const allowedOrigins = [
    env.frontendUrl,
    "http://localhost:3000",
  ].filter(Boolean) as string[];

  const io = new Server(server, {
    cors: {
      origin: allowedOrigins,
      methods: ["GET", "POST"],
      credentials: true,
    },
    transports: ["websocket", "polling"],
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Security: Apply JWT Middleware
  io.use(socketAuthMiddleware);

  // Core: Initialize SocketService for backend-wide access
  SocketService.init(io);

  registerSocketHandlers(io);
  return io;
};

