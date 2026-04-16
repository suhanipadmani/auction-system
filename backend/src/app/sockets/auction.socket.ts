import { Server, Socket } from "socket.io";
import { BidService } from "../services/bid.service";
import { UserModel } from "../models/user";

export const registerAuctionSocket = (io: Server, socket: Socket) => {
  socket.on("join-auction", (auctionId: string) => {
    socket.join(auctionId);
  });

  socket.on("place-bid", async (payload: { auctionId: string; amount: number; bidderId: string }) => {
    try {
      const bid = await BidService.placeBid(payload.bidderId, payload.auctionId, payload.amount);
      // Fetch bidder name for the broadcast
      const bidder = await UserModel.findById(payload.bidderId, "name");
      
      // Notify all users in the auction room about the new bid
      io.to(payload.auctionId).emit("new-bid-update", {
        auctionId: payload.auctionId,
        highestBid: bid.amount,
        highestBidderId: bid.bidderId,
        highestBidderName: bidder?.name || "Anonymous",
        bidId: (bid as any)._id
      });
    } catch (error: any) {
      // Send error only to the specific client
      socket.emit("bid-error", { message: error.message });
    }
  });

};
