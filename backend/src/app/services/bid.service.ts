import mongoose, { Types, ClientSession } from "mongoose";
import { AuctionModel } from "../models/auction";
import { BidModel } from "../models/bid";
import { TransactionModel } from "../models/transaction";
import { AUCTION_STATUSES, BID_STATUSES, TRANSACTION_SOURCES, TRANSACTION_STATUSES, TRANSACTION_TYPES } from "../enums";
import * as walletService from "./wallet.service";
import { BudgetService } from "./budget.service";
import { AppError } from "../utils/AppError";
import { SocketService } from "./socket.service";
import { NotificationService } from "./notification.service";
import { UserModel } from "../models/user";
import { maskName } from "../utils/masking";
import { NOTIFICATION_TYPES, AUDIT_ACTIONS } from "../enums";
import { AuditLogService } from "./auditLog.service";

// In-memory map to track last bid time for cooldowns
const lastBidMap = new Map<string, number>();

export class BidService {
  static async placeBid(bidderId: string, auctionId: string, amount: number) {
    const session = await this.startSession();
    if (session) session.startTransaction();

    try {
      const auction = await this.getValidatedAuction(auctionId, session);
      await this.validateBidder(bidderId);
      this.checkCooldown(bidderId);
      this.validateAmount(amount, auction);
      
      await BudgetService.validateBid(bidderId, auctionId, amount);

      // Handle transitions
      if (auction.highestBidderId) {
        await this.handleOutbid(auction, session);
      }

      await this.handleNewBid(bidderId, auction, amount, session);

      const result = await AuctionModel.findOneAndUpdate(
        { _id: auctionId, highestBid: auction.highestBid, status: AUCTION_STATUSES.ACTIVE },
        { 
          $set: { highestBid: amount, highestBidderId: new Types.ObjectId(bidderId) },
          $inc: { bidCount: 1 }
        },
        { session, new: true }
      );

      if (!result) throw new AppError("Bid conflict: Someone else may have placed a bid. Please try again.", 409);

      if (session) await session.commitTransaction();
      lastBidMap.set(bidderId, Date.now());

      await AuditLogService.log(bidderId, AUDIT_ACTIONS.BID_PLACED, { auctionId, auctionTitle: auction.title, amount });

      this.emitBidUpdates(auction, bidderId, amount);
      this.processAutoBids(auctionId.toString()).catch(e => console.error("Auto-bid error:", e));

      return { success: true };
    } catch (error: any) {
      if (session) await session.abortTransaction();
      throw error;
    } finally {
      if (session) session.endSession();
    }
  }

  private static async startSession() {
    try {
      return await mongoose.startSession();
    } catch (e) {
      console.warn("Transactions not supported, proceeding without safe session.");
      return null;
    }
  }

  private static async getValidatedAuction(auctionId: string, session: ClientSession | null) {
    const auction = session ? await AuctionModel.findById(auctionId).session(session) : await AuctionModel.findById(auctionId);
    if (!auction) throw new AppError("Auction not found", 404);
    if (auction.status !== AUCTION_STATUSES.ACTIVE) throw new AppError("Auction is not active", 400);
    if (new Date(auction.endTime).getTime() <= Date.now()) throw new AppError("Auction has already ended", 400);
    return auction;
  }

  private static async validateBidder(bidderId: string) {
    const bidder = await UserModel.findById(bidderId);
    if (!bidder || bidder.status !== "active") throw new AppError("Your account is not active", 403);
  }

  private static checkCooldown(bidderId: string) {
    const lastBidTime = lastBidMap.get(bidderId) || 0;
    const now = Date.now();
    if (now - lastBidTime < 1000) {
      throw new AppError(`Slow down! Please wait ${Math.ceil((1000 - (now - lastBidTime)) / 100) / 10}s before bidding again.`, 429);
    }
  }

  private static validateAmount(amount: number, auction: any) {
    const minRequired = auction.highestBid > 0 ? auction.highestBid + auction.minIncrement : auction.basePrice;
    if (amount < minRequired) throw new AppError(`Bid must be at least ${minRequired}`, 400);
    if (!Number.isFinite(amount) || amount <= 0) throw new AppError("Invalid bid amount", 400);
  }

  private static async handleOutbid(auction: any, session: ClientSession | null) {
    await BidModel.findOneAndUpdate(
      { auctionId: auction._id, bidderId: auction.highestBidderId, status: BID_STATUSES.ACTIVE },
      { $set: { status: BID_STATUSES.OUTBID } },
      { session: session || undefined }
    );
    await walletService.unlockFunds(auction.highestBidderId.toString(), auction.highestBid, session ?? undefined);
    
    await TransactionModel.create([{
      userId: auction.highestBidderId,
      amount: auction.highestBid,
      type: TRANSACTION_TYPES.UNLOCK,
      source: TRANSACTION_SOURCES.BID,
      status: TRANSACTION_STATUSES.SUCCESS,
      note: `Locked funds released for auction: ${auction.title}`
    }], { session: session || undefined });
  }

  private static async handleNewBid(bidderId: string, auction: any, amount: number, session: ClientSession | null) {
    await walletService.lockFunds(bidderId, amount, session ?? undefined);
    await TransactionModel.create([{
      userId: new Types.ObjectId(bidderId),
      amount,
      type: TRANSACTION_TYPES.LOCK,
      source: TRANSACTION_SOURCES.BID,
      status: TRANSACTION_STATUSES.SUCCESS,
      note: `Funds locked for bid on auction: ${auction.title}`
    }], { session });

    await BidModel.create([{
      auctionId: auction._id,
      bidderId: new Types.ObjectId(bidderId),
      amount,
      status: BID_STATUSES.ACTIVE
    }], { session });
  }

  private static async emitBidUpdates(auction: any, bidderId: string, amount: number) {
    const bidder = await UserModel.findById(bidderId).select("name");
    const maskedName = maskName(bidder?.name || "Anonymous");

    SocketService.emitToRoom(`auction:${auction._id}`, "new_bid", {
      type: "BID_UPDATED",
      payload: { auctionId: auction._id, amount, bidderId, bidderName: maskedName, timestamp: new Date() },
      timestamp: Date.now()
    });

    if (auction.highestBidderId && auction.highestBidderId.toString() !== bidderId) {
      await NotificationService.sendNotification(
        auction.highestBidderId.toString(),
        NOTIFICATION_TYPES.OUTBID,
        `You have been outbid on "${auction.title}". New highest bid: $${amount}`,
        `/dashboard/auctions/${auction._id}`
      );
    }

    await NotificationService.sendNotification(
      auction.sellerId.toString(),
      NOTIFICATION_TYPES.BID_RECEIVED,
      `New bid: $${amount} was placed on your auction "${auction.title}".`,
      `/dashboard/seller/auctions`
    );
  }

  static async setupAutoBid(bidderId: string, auctionId: string, limit: number) {
    const auction = await AuctionModel.findById(auctionId);
    if (!auction) throw new AppError("Auction not found", 404);
    if (limit <= (auction.highestBid || auction.basePrice)) throw new AppError("Limit must be higher than current price", 400);

    let bid = await BidModel.findOne({ auctionId, bidderId, isAutoBid: true });
    if (bid) {
      bid.autoBidLimit = limit;
      await bid.save();
    } else {
      bid = await BidModel.create({ auctionId, bidderId, amount: 0, isAutoBid: true, autoBidLimit: limit, status: BID_STATUSES.ACTIVE });
    }

    this.processAutoBids(auctionId).catch(err => console.error("Auto-bid error:", err));
    return bid;
  }

  static async processAutoBids(auctionId: string) {
    const auction = await AuctionModel.findById(auctionId);
    if (!auction || auction.status !== AUCTION_STATUSES.ACTIVE) return;

    const competingAutoBids = await BidModel.find({
      auctionId,
      isAutoBid: true,
      bidderId: { $ne: auction.highestBidderId },
      autoBidLimit: { $gt: auction.highestBid }
    }).select("+autoBidLimit").sort({ autoBidLimit: -1, createdAt: 1 });

    if (competingAutoBids.length > 0) {
      const bestAutoBid = competingAutoBids[0];
      const nextAmount = auction.highestBid + auction.minIncrement;

      if (nextAmount <= bestAutoBid.autoBidLimit!) {
        try {
          await this.placeBid(bestAutoBid.bidderId.toString(), auctionId, nextAmount);
        } catch (error: any) {
          console.error(`Failed auto-bid for user ${bestAutoBid.bidderId}:`, error.message);
        }
      }
    }
  }

  static async getBidStatus(bidderId: string, auctionId: string) {
    const [auction, userBid] = await Promise.all([
      AuctionModel.findById(auctionId),
      BidModel.findOne({ auctionId, bidderId }).select("+autoBidLimit").sort({ createdAt: -1 })
    ]);

    return {
      auctionStatus: auction?.status,
      currentHighestBid: auction?.highestBid,
      isHighestBidder: auction?.highestBidderId?.toString() === bidderId,
      yourLastBid: userBid?.amount || 0,
      bidStatus: userBid?.status,
      autoBidLimit: userBid?.autoBidLimit || null
    };
  }

  static async removeBid(bidId: string, adminId: string) {
    const session = await this.startSession();
    if (session) session.startTransaction();

    try {
      const bid = await BidModel.findById(bidId).session(session);
      if (!bid) throw new AppError("Bid not found", 404);
      if (bid.status === BID_STATUSES.CANCELLED as any) throw new AppError("Bid is already cancelled", 400);

      const auction = await AuctionModel.findById(bid.auctionId).session(session);
      if (!auction) throw new AppError("Auction not found", 404);

      const wasHighest = bid.status === BID_STATUSES.ACTIVE;
      bid.status = BID_STATUSES.CANCELLED as any;
      await bid.save({ session });

      // Always decrement bid count when a bid is removed
      auction.bidCount = Math.max(0, (auction.bidCount || 0) - 1);

      if (wasHighest) {
        await walletService.unlockFunds(bid.bidderId.toString(), bid.amount, session);
        
        const nextBid = await BidModel.findOne({ auctionId: auction._id, status: { $ne: BID_STATUSES.CANCELLED as any } })
          .sort({ amount: -1, createdAt: -1 })
          .session(session);

        if (nextBid) {
          nextBid.status = BID_STATUSES.ACTIVE;
          await nextBid.save({ session });
          auction.highestBid = nextBid.amount;
          auction.highestBidderId = nextBid.bidderId as any;
          await walletService.lockFunds(nextBid.bidderId.toString(), nextBid.amount, session);
        } else {
          auction.highestBid = 0;
          auction.highestBidderId = null;
        }
      }
      
      await auction.save({ session });

      if (session) await session.commitTransaction();

      await AuditLogService.log(adminId, AUDIT_ACTIONS.AUCTION_CREATED, { action: "BID_REMOVED", bidId, auctionId: auction._id });
      await NotificationService.sendNotification(bid.bidderId.toString(), NOTIFICATION_TYPES.AUCTION_END, `Your bid on "${auction.title}" was removed by admin. Funds refunded.`);

      SocketService.emitToRoom(`auction:${auction._id}`, "bid_removed", {
        type: "BID_REMOVED",
        payload: { auctionId: auction._id, bidId, newHighestBid: auction.highestBid, newHighestBidderId: auction.highestBidderId },
        timestamp: Date.now()
      });

      return { success: true };
    } catch (error: any) {
      if (session) await session.abortTransaction();
      throw error;
    } finally {
      if (session) session.endSession();
    }
  }
}
