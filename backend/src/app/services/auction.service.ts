import mongoose, { Types, ClientSession } from "mongoose";
import { AUCTION_STATUSES } from "../enums";
import { AuctionModel } from "../models/auction";
import { BidModel } from "../models/bid";
import { completeTransfer } from "./wallet.service";
import { AppError } from "../utils/AppError";
import { ICreateAuctionData, IUpdateAuctionData, IAuctionFilters, IPaginationOptions } from "../types/auction";

export class AuctionService {
  static async createAuction(userId: string, data: ICreateAuctionData) {
    const auction = await AuctionModel.create({
      ...data,
      sellerId: userId,
      status: "pending",
    });
    return auction;
  }

  static async updateAuction(auctionId: string, userId: string, data: IUpdateAuctionData) {

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

  static async getAuctions(filters: IAuctionFilters, options: IPaginationOptions) {
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

    // Auto-end: active -> ended or expired
    const activeAuctions = await AuctionModel.find({ status: "active", endTime: { $lte: now } });
    
    let endedCount = 0;
    let expiredCount = 0;

    for (const auction of activeAuctions) {
      if (auction.highestBidderId) {
        auction.status = AUCTION_STATUSES.ENDED;
        endedCount++;
      } else {
        auction.status = AUCTION_STATUSES.EXPIRED;
        expiredCount++;
      }
      await auction.save();
    }

    return { startedCount: started.modifiedCount, endedCount, expiredCount };
  }

  static async finalizeAuction(auctionId: string, userId: string, isAuto = false) {
    let session: ClientSession | null = null;
    try {
      session = await mongoose.startSession();
      session.startTransaction();
    } catch (e) {
      console.warn("[AUCTION] Transactions not supported, proceeding without safe session.");
      session = null; // Neutralize session so it isn't passed to models
    }

    try {
      const auction = session 
        ? await AuctionModel.findById(auctionId).session(session)
        : await AuctionModel.findById(auctionId);

      if (!auction) {
        console.error(`[AUCTION] Auction ${auctionId} not found`);
        throw new AppError("Auction not found", 404);
      }


      if (auction.status !== AUCTION_STATUSES.ENDED) {
        console.error(`[AUCTION] Invalid status: ${auction.status}`);
        throw new AppError(`Auction is not in ENDED status (Current: ${auction.status})`, 400);
      }

      if (!isAuto && auction.sellerId.toString() !== userId) {
        console.error(`[AUCTION] Unauthorized: Seller ${auction.sellerId} vs Requester ${userId}`);
        throw new AppError("Unauthorized: Only the seller can finalize this auction", 403);
      }

      if (!auction.highestBidderId) {
        console.error(`[AUCTION] No winner for auction ${auctionId}`);
        throw new AppError("Cannot finalize an auction with no bidder", 400);
      }

      // 1. Complete fund transfer
      await completeTransfer(
        auction.highestBidderId.toString(),
        auction.sellerId.toString(),
        auction.highestBid,
        auction.title,
        session ?? undefined
      );
      // 2. Mark as sold
      auction.status = AUCTION_STATUSES.SOLD;
      
      if (session) {
        await auction.save({ session });
        await session.commitTransaction();
      } else {
        await auction.save();
      }

      if (session) session.endSession();
      
      return auction;
    } catch (error: any) {
      console.error(`[AUCTION] Finalization failed: ${error.message}`);
      if (session) {
        await session.abortTransaction();
        session.endSession();
      }
      throw error;
    }
  }

  static async autoFinalizeEndedAuctions() {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    // Find auctions that ended more than 24 hours ago and haven't been sold
    const pendingAuctions = await AuctionModel.find({
      status: AUCTION_STATUSES.ENDED,
      updatedAt: { $lte: twentyFourHoursAgo }
    });

    let finalizedCount = 0;
    for (const auction of pendingAuctions) {
      try {
        await this.finalizeAuction(auction._id.toString(), "", true);
        finalizedCount++;
      } catch (error) {
        console.error(`[CRON] Auto-finalize failed for auction ${auction._id}:`, error);
      }
    }

    return finalizedCount;
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

  static async getMyBiddingActivity(userId: string) {
    // 1. Find all auction IDs the user has bid on
    const userAuctionIds = await BidModel.distinct("auctionId", { bidderId: userId });

    // 2. Fetch these auctions with seller details
    const auctions = await AuctionModel.find({ _id: { $in: userAuctionIds } })
      .sort({ endTime: -1 })
      .populate("sellerId", "name");

    // 3. Calculate summary stats
    const stats = {
      activeWinningCount: 0,
      activeOutbidCount: 0,
      wonCount: 0,
    };

    const categorizedAuctions = auctions.map(auction => {
      const isWinner = auction.highestBidderId?.toString() === userId;
      
      if (auction.status === AUCTION_STATUSES.ACTIVE) {
        if (isWinner) stats.activeWinningCount++;
        else stats.activeOutbidCount++;
      } else if ([AUCTION_STATUSES.ENDED, AUCTION_STATUSES.SOLD].includes(auction.status as any)) {
        if (isWinner) stats.wonCount++;
      }

      return {
        ...auction.toObject(),
        currentUserStatus: isWinner ? "winning" : "outbid"
      };
    });

    return {
      data: categorizedAuctions,
      stats
    };
  }

  static async getSellerStats(userId: string) {
    const [activeCount, soldCount, earningsResult] = await Promise.all([
      // Count active listings
      AuctionModel.countDocuments({ sellerId: userId, status: AUCTION_STATUSES.ACTIVE }),
      
      // Count completed sales
      AuctionModel.countDocuments({ sellerId: userId, status: AUCTION_STATUSES.SOLD }),
      
      // Calculate total earnings
      AuctionModel.aggregate([
        { $match: { sellerId: new Types.ObjectId(userId), status: AUCTION_STATUSES.SOLD } },
        { $group: { _id: null, total: { $sum: "$highestBid" } } }
      ])
    ]);

    return {
      activeListings: activeCount,
      completedSales: soldCount,
      totalEarnings: earningsResult[0]?.total || 0
    };
  }

  static async getAdminStats() {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [totalAuctions, revenueResult, bidsToday] = await Promise.all([
      AuctionModel.countDocuments(),
      AuctionModel.aggregate([
        { $match: { status: AUCTION_STATUSES.SOLD } },
        { $group: { _id: null, total: { $sum: "$highestBid" } } }
      ]),
      BidModel.countDocuments({ createdAt: { $gte: startOfToday } })
    ]);

    return {
      totalAuctions,
      systemRevenue: revenueResult[0]?.total || 0,
      bidsToday
    };
  }

  static async getAdminInventory(filters: IAuctionFilters, options: IPaginationOptions) {
    const { page = 1, limit = 10 } = options;
    const skip = (page - 1) * limit;

    const { search, ...otherFilters } = filters;
    const query: any = { ...otherFilters };

    if (search) {
      // Find sellers matching search name
      const { UserModel } = require("../models/user");
      const matchingSellers = await UserModel.find({ 
        name: { $regex: search, $options: "i" } 
      }).select("_id");
      
      const sellerIds = matchingSellers.map((s: any) => s._id);

      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { sellerId: { $in: sellerIds } }
      ];
    }

    const [data, total] = await Promise.all([
      AuctionModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).populate("sellerId", "name"),
      AuctionModel.countDocuments(query),
    ]);

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }
}

