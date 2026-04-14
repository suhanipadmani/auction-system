import { Server, Socket } from "socket.io";

export const registerAuctionSocket = (io: Server, socket: Socket) => {
  socket.on("join-auction", (auctionId: string) => {
    socket.join(auctionId);
  });

  socket.on("place-bid", (payload: { auctionId: string; amount: number }) => {
    io.to(payload.auctionId).emit("new-bid-update", payload);
  });
};
