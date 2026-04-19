import { Server } from "socket.io";
import { registerAuctionSocket } from "./auction.socket";

export const registerSocketHandlers = (io: Server) => {
  io.on("connection", (socket) => {
    // Joined default room
    socket.join("global");
    registerAuctionSocket(io, socket);
  });
};
