import { Server } from "socket.io";
import { registerAuctionSocket } from "./auction.socket";

export const registerSocketHandlers = (io: Server) => {
  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);
    registerAuctionSocket(io, socket);
  });
};
