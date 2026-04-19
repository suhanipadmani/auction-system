import mongoose, { Types, ClientSession } from "mongoose";
import { AUCTION_STATUSES, BID_STATUSES } from "../enums";
import { AuctionModel } from "../models/auction";
import { BidModel } from "../models/bid";
import * as walletService from "./wallet.service";
import { AppError } from "../utils/AppError";
import { SocketService } from "./socket.service";
import { NotificationService } from "./notification.service";
import { NOTIFICATION_TYPES } from "../enums";
import { ICreateAuctionData, IUpdateAuctionData, IAuctionFilters, IPaginationOptions } from "../types/auction";
import { UserModel } from "../models/user";
import { AuditLogService } from "./auditLog.service";
import { AUDIT_ACTIONS } from "../enums";
import { maskName } from "../utils/masking";

export class AuctionService {
  static async createAuction(userId: string, data: ICreateAuctionData) {
    const auction = await AuctionModel.create({
      ...data,
      sellerId: userId,
      status: "pending",
    });

    // Notify ALL Admins for review request
    await NotificationService.notifyAdmins(
      NOTIFICATION_TYPES.AUCTION_REQUEST,
      `New Auction Request: "${auction.title}" requires your review.`,
      `/admin/auctions`
    );

    // Log the action
    await AuditLogService.log(userId, AUDIT_ACTIONS.AUCTION_CREATED, {
      auctionId: auction._id,
      title: auction.title,
      basePrice: auction.basePrice
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

  static async cancelAuction(auctionId: string, user: { id: string; role: string }) {
    const auction = await AuctionModel.findById(auctionId);
    if (!auction) throw new Error("Auction not found");

    const isAdmin = user.role === "admin";
    const isOwner = auction.sellerId.toString() === user.id;

    if (!isAdmin && !isOwner) {
      throw new Error("Unauthorized");
    }

    // Role-based status check
    if (!isAdmin) {
      // Sellers can only cancel if not active
      if (auction.status === AUCTION_STATUSES.ACTIVE) {
        throw new Error("Sellers cannot cancel an active auction. Please contact administration.");
      }
    }

    // If cancelled after already ended/sold/etc
    if ([AUCTION_STATUSES.CANCELLED, AUCTION_STATUSES.SOLD, AUCTION_STATUSES.EXPIRED].includes(auction.status as any)) {
      throw new Error(`Auction is already ${auction.status}`);
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const oldStatus = auction.status;
      auction.status = AUCTION_STATUSES.CANCELLED;
      await auction.save({ session });

      // If it was active, we may have a lead bidder to refund
      // Actually, we should refund ALL active bids on this auction (usually only one is active at a time though, but for safety...)
      const activeBids = await BidModel.find({ auctionId: auction._id, status: BID_STATUSES.ACTIVE }).session(session);

      for (const bid of activeBids) {
        // Unlock funds
        await walletService.unlockFunds(bid.bidderId.toString(), bid.amount, session);
        
        // Mark bid as cancelled
        bid.status = BID_STATUSES.CANCELLED as any;
        await bid.save({ session });

        // Notify bidder
        await NotificationService.sendNotification(
          bid.bidderId.toString(),
          NOTIFICATION_TYPES.AUCTION_END,
          `The auction "${auction.title}" has been cancelled. Your bid of $${bid.amount} has been refunded to your wallet.`,
          `/dashboard/auctions/${auction._id}`
        );
      }

      await session.commitTransaction();
      session.endSession();

      // Log the action
      await AuditLogService.log(user.id, AUDIT_ACTIONS.AUCTION_CREATED, { // Using AUCTION_CREATED for logging but with action context
        action: "CANCELLED",
        auctionId: auction._id,
        title: auction.title,
        previousStatus: oldStatus
      });

      // Broadcast status change
      SocketService.emitToRoom(`auction:${auction._id}`, "auction_status_update", {
        type: "AUCTION_CANCELLED",
        payload: { auctionId: auction._id, status: AUCTION_STATUSES.CANCELLED },
        timestamp: Date.now()
      });

      return auction;
    } catch (error: any) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  static async getAuctions(filters: IAuctionFilters, options: IPaginationOptions & { sortBy?: string; sortOrder?: "asc" | "desc" }) {
    const { page = 1, limit = 20, sortBy = "startTime", sortOrder = "asc" } = options;
    const skip = (page - 1) * limit;

    const queryIndex: any = { ...filters };
    const { search, ...query } = queryIndex;

    // Default visibility for bidders (if no status specified)
    if (!query.status && !query.sellerId) {
      query.status = { $in: ["approved", "active"] };
    }

    // Handle "past" status alias
    if (query.status === "past") {
      query.status = { $in: [AUCTION_STATUSES.ENDED, AUCTION_STATUSES.SOLD, AUCTION_STATUSES.EXPIRED, AUCTION_STATUSES.CANCELLED] };
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const sort: any = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    const [data, total] = await Promise.all([
      AuctionModel.find(query).sort(sort).skip(skip).limit(limit).populate("sellerId", "name"),
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

    // 1. Notify the Seller
    const sellerId = auction.sellerId.toString();
    const message = action === "approve"
      ? `Success! Your auction "${auction.title}" has been approved and will start at ${new Date(auction.startTime).toLocaleString()}.`
      : `Notification: Your auction "${auction.title}" was not approved by the administrator.`;

    await NotificationService.sendNotification(
      sellerId,
      action === "approve" ? NOTIFICATION_TYPES.AUCTION_END : NOTIFICATION_TYPES.AUCTION_END,
      message,
      `/dashboard/seller/auctions`
    );

    // 2. Global announcement for bidders (If Approved)
    if (action === "approve") {
      SocketService.emitToAll("global_notification", {
        type: "NEW_AUCTION_ANNOUNCEMENT",
        payload: {
          message: `New Auction: "${auction.title}" was just approved! Checks it out under Upcoming Auctions.`,
          auctionId: auction._id,
        },
        timestamp: Date.now()
      });
    }

    return auction;
  }

  static async autoTransition() {
    const now = new Date();

    // 1. Auto-start: approved -> active
    const auctionsToStart = await AuctionModel.find({ status: "approved", startTime: { $lte: now } });
    if (auctionsToStart.length > 0) {
      await AuctionModel.updateMany(
        { _id: { $in: auctionsToStart.map(a => a._id) } },
        { $set: { status: AUCTION_STATUSES.ACTIVE } }
      );

      for (const auction of auctionsToStart) {
        SocketService.emitToRoom(`auction:${auction._id}`, "auction_status_update", {
          type: "AUCTION_LIVE",
          payload: { auctionId: auction._id, status: AUCTION_STATUSES.ACTIVE },
          timestamp: Date.now()
        });
      }
    }

    // 2. NEW: Ending Soon Alert (Active auctions ending in < 30 mins)
    const thirtyMinsFromNow = new Date(now.getTime() + 30 * 60000);
    const endingSoonAuctions = await AuctionModel.find({
      status: AUCTION_STATUSES.ACTIVE,
      endTime: { $lte: thirtyMinsFromNow, $gt: now },
      endingSoonNotified: { $ne: true }
    });

    for (const auction of endingSoonAuctions) {
      // Find all bidders for this auction to notify them
      const bidders = await BidModel.distinct("bidderId", { auctionId: auction._id });

      for (const bidderId of bidders) {
        await NotificationService.sendNotification(
          bidderId.toString(),
          NOTIFICATION_TYPES.ENDING_SOON,
          `Hurry! The auction "${auction.title}" is ending in less than 30 minutes. Place your final bids now!`,
          `/dashboard/auctions/${auction._id}`
        );
      }

      auction.endingSoonNotified = true;
      await auction.save();
    }

    // 3. Auto-end: active -> ended or expired
    const activeAuctions = await AuctionModel.find({ 
      status: AUCTION_STATUSES.ACTIVE, 
      endTime: { $lte: now } 
    });

    let endedCount = 0;
    let expiredCount = 0;

    for (const auction of activeAuctions) {
      const oldStatus = auction.status;
      if (auction.highestBidderId) {
        auction.status = AUCTION_STATUSES.ENDED;
        endedCount++;

        // Case 4: History Preservation - Mark winning/losing bids
        await BidModel.findOneAndUpdate(
          { auctionId: auction._id, bidderId: auction.highestBidderId, status: BID_STATUSES.ACTIVE },
          { $set: { status: BID_STATUSES.WON } }
        );

        await BidModel.updateMany(
          { auctionId: auction._id, bidderId: { $ne: auction.highestBidderId }, status: { $in: [BID_STATUSES.ACTIVE, BID_STATUSES.OUTBID] } },
          { $set: { status: BID_STATUSES.LOST } }
        );

      } else {
        auction.status = AUCTION_STATUSES.EXPIRED;
        expiredCount++;

        // Mark all bids as LOST if expired
        await BidModel.updateMany(
          { auctionId: auction._id, status: { $in: [BID_STATUSES.ACTIVE, BID_STATUSES.OUTBID] } },
          { $set: { status: BID_STATUSES.LOST } }
        );
      }
      await auction.save();

      // Broadcast status change to the auction room
      SocketService.emitToRoom(`auction:${auction._id}`, "auction_status_update", {
        type: "AUCTION_ENDED",
        payload: {
          auctionId: auction._id,
          status: auction.status,
          winnerId: auction.highestBidderId,
          finalPrice: auction.highestBid
        },
        timestamp: Date.now()
      });

      // Send Notifications for winning/ending
      if (auction.highestBidderId) {
        // 1. Notify Winner
        await NotificationService.sendNotification(
          auction.highestBidderId.toString(),
          NOTIFICATION_TYPES.WIN,
          `Congratulations! You won the auction: "${auction.title}" for $${auction.highestBid}`,
          `/dashboard/auctions/${auction._id}`
        );

        // 2. Notify Seller
        await NotificationService.sendNotification(
          auction.sellerId.toString(),
          NOTIFICATION_TYPES.AUCTION_END,
          `Your auction "${auction.title}" has ended. Final bid: $${auction.highestBid}`,
          `/dashboard/seller/auctions`
        );

        // 3. NEW: Notify Losers (All other bidders)
        const losers = await BidModel.distinct("bidderId", {
          auctionId: auction._id,
          bidderId: { $ne: auction.highestBidderId }
        });

        for (const loserId of losers) {
          await NotificationService.sendNotification(
            loserId.toString(),
            NOTIFICATION_TYPES.LOSS,
            `The auction for "${auction.title}" has ended. Unfortunately, you were not the highest bidder.`,
            `/dashboard/auctions/${auction._id}`
          );
        }
      } else {
        // Expired auction notification for seller
        await NotificationService.sendNotification(
          auction.sellerId.toString(),
          NOTIFICATION_TYPES.AUCTION_END,
          `Your auction "${auction.title}" has expired with no bids.`
        );
      }
    }

    return { startedCount: auctionsToStart.length, endedCount, expiredCount };
  }

  static async finalizeAuction(auctionId: string, userId: string, isAuto = false) {
    let session: ClientSession | null = null;
    try {
      session = await mongoose.startSession();
      session.startTransaction();
    } catch (e) {
      console.warn("[AUCTION] Transactions not supported, proceeding without safe session.");
      session = null;
    }

    try {
      const auction = session
        ? await AuctionModel.findById(auctionId).session(session)
        : await AuctionModel.findById(auctionId);

      if (!auction) {
        throw new AppError("Auction not found", 404);
      }


      if (auction.status !== AUCTION_STATUSES.ENDED) {
        throw new AppError(`Auction is not in ENDED status (Current: ${auction.status})`, 400);
      }

      if (!isAuto && auction.sellerId.toString() !== userId) {
        throw new AppError("Unauthorized: Only the seller can finalize this auction", 403);
      }

      if (!auction.highestBidderId) {
        throw new AppError("Cannot finalize an auction with no bidder", 400);
      }

      // 1. Complete fund transfer
      await walletService.completeTransfer(
        auction.highestBidderId.toString(),
        auction.sellerId.toString(),
        auction.highestBid,
        auction.title,
        session
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

      // Notify Seller (Sold)
      await NotificationService.sendNotification(
        auction.sellerId.toString(),
        NOTIFICATION_TYPES.AUCTION_END,
        `Payment received! Auction "${auction.title}" is now finalized.`
      );

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

    // Broadcast manual status change
    SocketService.emitToRoom(`auction:${auctionId}`, "auction_status_update", {
      type: action === "start" ? "AUCTION_LIVE" : "AUCTION_ENDED",
      payload: { auctionId, status: auction.status },
      timestamp: Date.now()
    });

    return auction;
  }

  static async getMyBiddingActivity(userId: string, options: { page?: number; limit?: number; tab?: string } = {}) {
    const { page = 1, limit = 20, tab = "all" } = options;
    const skip = (page - 1) * limit;

    // Aggregation to get stats and categorized auctions in one go (or more efficiently)
    // For now, keeping the logic but cleaning it up
    const userAuctionIds = await BidModel.distinct("auctionId", { bidderId: userId });
    const allAuctions = await AuctionModel.find({ _id: { $in: userAuctionIds } }).sort({ endTime: -1 });

    const stats = {
      activeWinningCount: 0,
      activeOutbidCount: 0,
      wonCount: 0,
      lossCount: 0,
      totalSpent: 0,
    };

    const categorizedAll = allAuctions.map(auction => {
      const isWinner = auction.highestBidderId?.toString() === userId;
      if (auction.status === AUCTION_STATUSES.ACTIVE) {
        if (isWinner) stats.activeWinningCount++;
        else stats.activeOutbidCount++;
      } else if ([AUCTION_STATUSES.ENDED, AUCTION_STATUSES.SOLD].includes(auction.status as any)) {
        if (isWinner) {
          stats.wonCount++;
          if (auction.status === AUCTION_STATUSES.SOLD) stats.totalSpent += auction.highestBid || 0;
        } else {
          stats.lossCount++;
        }
      }
      return { ...auction.toObject(), currentUserStatus: isWinner ? "winning" : "outbid" };
    });

    let filtered = categorizedAll;
    if (tab === "active") filtered = categorizedAll.filter(a => a.status === AUCTION_STATUSES.ACTIVE);
    else if (tab === "won") filtered = categorizedAll.filter(a => [AUCTION_STATUSES.SOLD, AUCTION_STATUSES.ENDED].includes(a.status as any) && a.currentUserStatus === "winning");
    else if (tab === "past") filtered = categorizedAll.filter(a => (a.status !== AUCTION_STATUSES.ACTIVE && a.currentUserStatus === "outbid") || (a.status === AUCTION_STATUSES.EXPIRED));

    const total = filtered.length;
    return {
      data: filtered.slice(skip, skip + limit),
      total,
      page,
      totalPages: Math.ceil(total / limit),
      stats
    };
  }

  static async getAuctionBids(auctionId: string, requesterId?: string, requesterRole?: string) {
    const bids = await BidModel.find({ auctionId })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("bidderId", "name");

    return bids.map(bid => {
      const bidder = bid.bidderId as any;
      const bidderIdStr = bidder?._id?.toString();
      const isOwner = requesterId && bidderIdStr === requesterId;
      const isAdmin = requesterRole === "admin";
      
      const displayName = (isOwner || isAdmin) 
        ? (bidder?.name || "[Deleted User]") 
        : maskName(bidder?.name || "Anonymous User");
      
      return {
        _id: bid._id,
        amount: bid.amount,
        status: bid.status,
        createdAt: bid.createdAt,
        isAutoBid: bid.isAutoBid,
        bidderName: displayName,
        isMine: isOwner
      };
    });
  }
}