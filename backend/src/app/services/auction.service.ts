import { Types } from "mongoose";
import { AUCTION_STATUSES } from "../enums";
import { AuctionModel } from "../models/auction";

export class AuctionService {
  static async createAuction(userId: string, data: any) {
    const auction = await AuctionModel.create({
      ...data,
      sellerId: userId,
      status: "pending",
    });
    return auction;
  }

  static async updateAuction(auctionId: string, userId: string, data: any) {
    const auction = await AuctionModel.findById(auctionId);
    if (!auction) throw new Error("Auction not found");

    // Ownership check
    if (auction.sellerId.toString() !== userId) {
      throw new Error("Unauthorized: You do not own this auction");
    }

    // Status check: only allow editing before start and if not rejected/cancelled
    if (["active", "ended", "cancelled"].includes(auction.status)) {
      throw new Error(`Cannot edit auction in ${auction.status} status`);
    }

    if (new Date(auction.startTime).getTime() <= Date.now()) {
      throw new Error("Cannot edit auction after it has started");
    }

    Object.assign(auction, data);
    await auction.save();
    return auction;
  }

  static async cancelAuction(auctionId: string, userId: string) {
    const auction = await AuctionModel.findById(auctionId);
    if (!auction) throw new Error("Auction not found");

    if (auction.sellerId.toString() !== userId) {
      throw new Error("Unauthorized");
    }

    if (auction.status === "active") {
      throw new Error("Cannot cancel an active auction");
    }

    auction.status = AUCTION_STATUSES.CANCELLED;
    await auction.save();
    return auction;
  }

  static async getAuctions(filters: any, options: { page: number; limit: number }) {
    const { page = 1, limit = 10 } = options;
    const skip = (page - 1) * limit;

    const query: any = { ...filters };
    
    // Default visibility for bidders (if no status specified)
    if (!query.status && !query.sellerId) {
       query.status = { $in: ["approved", "active"] };
    }

    const [data, total] = await Promise.all([
      AuctionModel.find(query).sort({ startTime: 1 }).skip(skip).limit(limit).populate("sellerId", "name"),
      AuctionModel.countDocuments(query),
    ]);

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  static async getAuctionById(id: string) {
    const auction = await AuctionModel.findById(id).populate("sellerId", "name");
    if (!auction) throw new Error("Auction not found");
    return auction;
  }

  static async adminApproveReject(auctionId: string, action: "approve" | "reject") {
    const auction = await AuctionModel.findById(auctionId);
    if (!auction) throw new Error("Auction not found");

    if (auction.status !== "pending") {
      throw new Error(`Auction is already ${auction.status}`);
    }

    auction.status = action === "approve" ? AUCTION_STATUSES.APPROVED : AUCTION_STATUSES.REJECTED;
    await auction.save();
    return auction;
  }

  static async autoTransition() {
    const now = new Date();

    // Auto-start: approved -> active
    const started = await AuctionModel.updateMany(
      { status: "approved", startTime: { $lte: now } },
      { $set: { status: "active" } }
    );

    // Auto-end: active -> ended
    const ended = await AuctionModel.updateMany(
      { status: "active", endTime: { $lte: now } },
      { $set: { status: "ended" } }
    );

    return { startedCount: started.modifiedCount, endedCount: ended.modifiedCount };
  }

  static async forceAction(auctionId: string, action: "start" | "end") {
    const auction = await AuctionModel.findById(auctionId);
    if (!auction) throw new Error("Auction not found");

    if (action === "start") {
      if (auction.status !== "approved") throw new Error("Only approved auctions can be started");
      auction.status = AUCTION_STATUSES.ACTIVE;
    } else {
      if (auction.status !== "active") throw new Error("Only active auctions can be ended");
      auction.status = AUCTION_STATUSES.ENDED;
    }

    await auction.save();
    return auction;
  }
}
