import { Server, Socket } from "socket.io";
import { BidService } from "../services/bid.service";
import { UserModel } from "../models/user";
import { SocketService } from "../services/socket.service";

export const registerAuctionSocket = (io: Server, socket: Socket) => {
  const user = (socket as any).user;

  // 1. Join personal room for private notifications
  socket.on("join_user", (userId: string) => {
    // Guest protection: Guests have no personal room
    if (!user) return;
    
    // Security: Only allow joining own room
    if (user.id === userId) {
      socket.join(`user:${userId}`);
    }
  });

  // 2. Join auction room for live updates
  socket.on("join_auction", (auctionId: string) => {
    socket.join(`auction:${auctionId}`);
  });

  // 3. Handle Bid placement (Real-time trigger)
  socket.on("place_bid", async (payload: { auctionId: string; amount: number }) => {
    try {
      // Guest protection: Guests cannot bid
      if (!user) {
        throw new Error("You must be logged in to place a bid");
      }

      if (typeof payload.amount !== 'number' || isNaN(payload.amount)) {
         throw new Error("Invalid bid amount: Must be a number");
      }
      await BidService.placeBid(user.id, payload.auctionId, payload.amount);
      // Actual emission happens inside BidService after DB success
    } catch (error: any) {
      socket.emit("error", { 
        type: "BID_ERROR",
        message: error.message,
        timestamp: Date.now()
      });
    }
  });

  socket.on("disconnect", () => {
    // Socket.io handles room cleanup automatically
  });
};
