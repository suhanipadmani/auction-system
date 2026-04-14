import { Server as HttpServer } from "http";
import { Server } from "socket.io";
import { env } from "../config";
import { registerSocketHandlers } from "../app/sockets";

export const socketLoader = (server: HttpServer) => {
  const io = new Server(server, {
    cors: { origin: env.frontendUrl },
  });

  registerSocketHandlers(io);
  return io;
};
