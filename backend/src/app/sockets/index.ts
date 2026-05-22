import { Server } from "socket.io";
import { registerAuctionSocket } from "./auction.socket";

export const registerSocketHandlers = (io: Server) => {
  io.on("connection", (socket) => {
    const user = (socket as any).user;
    
    // Join global room
    socket.join("global");

    // Join personal room if authenticated
    if (user?.id) {
      socket.join(`user:${user.id}`);
    }

    registerAuctionSocket(io, socket);
  });
};
