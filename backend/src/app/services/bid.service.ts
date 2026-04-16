import mongoose, { Types, ClientSession } from "mongoose";
import { AuctionModel } from "../models/auction";
import { BidModel } from "../models/bid";
import { TransactionModel } from "../models/transaction";
import { AUCTION_STATUSES, BID_STATUSES, TRANSACTION_SOURCES, TRANSACTION_STATUSES, TRANSACTION_TYPES } from "../enums";
import * as walletService from "./wallet.service";
import { BudgetService } from "./budget.service";
import { AppError } from "../utils/AppError";

export class BidService {
  /**
   * Places a manual bid on an auction.
   */
  static async placeBid(bidderId: string, auctionId: string, amount: number) {
    let session: ClientSession | null = null;
    try {
      session = await mongoose.startSession();

    } catch (e) {
      console.warn("Transactions not supported, proceeding without safe session.");
    }

    if (session) session.startTransaction();

    try {
      // 1. Get auction and validate (using session if available)
      const auction = session 
        ? await AuctionModel.findById(auctionId).session(session)
        : await AuctionModel.findById(auctionId);
      if (!auction) throw new Error("Auction not found");
      
      if (auction.status !== AUCTION_STATUSES.ACTIVE) {
        throw new Error(`Auction is not active (Status: ${auction.status})`);
      }

      if (auction.sellerId.toString() === bidderId) {
        throw new Error("Sellers cannot bid on their own auctions");
      }

      if (new Date(auction.endTime).getTime() <= Date.now()) {
          throw new Error("Auction has already ended");
      }

      // 2. Validate bid amount
      const minRequired = auction.highestBid > 0 
        ? auction.highestBid + auction.minIncrement 
        : auction.basePrice;
      
      if (amount < minRequired) {
        throw new AppError(`Bid must be at least ${minRequired}`, 400);
      }

      // NEW: Budget Validation
      await BudgetService.validateBid(bidderId, auctionId, amount);

      // 3. Handle previous highest bidder (Unlock funds)
      if (auction.highestBidderId) {
        // Mark previous bid as outbid
        await BidModel.findOneAndUpdate(
          { auctionId, bidderId: auction.highestBidderId, status: BID_STATUSES.ACTIVE },
          { $set: { status: BID_STATUSES.OUTBID } },
          { session: session || undefined }
        );

        // Unlock funds for previous bidder
        await walletService.unlockFunds(auction.highestBidderId.toString(), auction.highestBid, session ?? undefined);

        // Create unlock transaction record
        await TransactionModel.create([{
          userId: auction.highestBidderId,
          amount: auction.highestBid,
          type: TRANSACTION_TYPES.UNLOCK,
          source: TRANSACTION_SOURCES.BID,
          status: TRANSACTION_STATUSES.SUCCESS,
          note: `Locked funds released for auction: ${auction.title}`
        }], { session: session || undefined });
      }

      // 4. Handle new bidder (Lock funds)
      await walletService.lockFunds(bidderId, amount, session ?? undefined);

      // Create lock transaction record
      await TransactionModel.create([{
        userId: new Types.ObjectId(bidderId),
        amount: amount,
        type: TRANSACTION_TYPES.LOCK,
        source: TRANSACTION_SOURCES.BID,
        status: TRANSACTION_STATUSES.SUCCESS,
        note: `Funds locked for bid on auction: ${auction.title}`
      }], { session: session || undefined });

      // 5. Create new Bid record
      const [bid] = await BidModel.create([{
        auctionId: auction._id,
        bidderId: new Types.ObjectId(bidderId),
        amount,
        status: BID_STATUSES.ACTIVE
      }], { session: session || undefined });

      // 6. Update Auction
      auction.highestBid = amount;
      auction.highestBidderId = new Types.ObjectId(bidderId);
      
      if (session) {
        await auction.save({ session });
        await session.commitTransaction();
      } else {
        await auction.save();
      }
      
      // End session
      if (session) session.endSession();
      
      // Trigger auto-bidding logic (Async, outside transaction if needed or inside if atomic)
      // For now, let's keep it sequential
      this.processAutoBids(auctionId.toString()).catch(err => console.error("Auto-bid error:", err));

      return bid;
    } catch (error: any) {
      if (session) {
        await session.abortTransaction();
        session.endSession();
      }
      throw error;
    }
  }

  /**
   * Sets up auto-bidding for a user.
   */
  static async setupAutoBid(bidderId: string, auctionId: string, limit: number) {
    const auction = await AuctionModel.findById(auctionId);
    if (!auction) throw new Error("Auction not found");

    if (limit <= (auction.highestBid || auction.basePrice)) {
      throw new Error("Auto-bid limit must be higher than the current price");
    }

    // Upsert auto-bid settings (either update existing or create new)
    let bid = await BidModel.findOne({ auctionId, bidderId, isAutoBid: true });

    if (bid) {
      bid.autoBidLimit = limit;
      await bid.save();
    } else {
      bid = await BidModel.create({
        auctionId,
        bidderId,
        amount: 0, 
        isAutoBid: true,
        autoBidLimit: limit,
        status: BID_STATUSES.ACTIVE
      });
    }

    // Try to trigger auto-bid immediately if it's currently low
    this.processAutoBids(auctionId).catch(err => console.error("Auto-bid error:", err));

    return bid;
  }

  /**
   * Processes all auto-bids for an auction to find the new highest bid.
   */
  static async processAutoBids(auctionId: string) {
    const auction = await AuctionModel.findById(auctionId);
    if (!auction || auction.status !== AUCTION_STATUSES.ACTIVE) return;

    const currentHighestBid = auction.highestBid;
    const currentHighestBidder = auction.highestBidderId;

    // Find the best competing auto-bid
    const competingAutoBids = await BidModel.find({
      auctionId,
      isAutoBid: true,
      bidderId: { $ne: currentHighestBidder },
      autoBidLimit: { $gt: currentHighestBid }
    }).sort({ autoBidLimit: -1, createdAt: 1 });

    if (competingAutoBids.length > 0) {
      const bestAutoBid = competingAutoBids[0];
      const nextAmount = currentHighestBid + auction.minIncrement;

      // Ensure we don't exceed the limit
      if (nextAmount <= bestAutoBid.autoBidLimit!) {
        try {
          await this.placeBid(bestAutoBid.bidderId.toString(), auctionId, nextAmount);
        } catch (error: any) {
          console.error(`Failed auto-bid for user ${bestAutoBid.bidderId}:`, error.message);
        }
      }
    }
  }

  /**
   * Gets the current bidding status for a user on a specific auction.
   */
  static async getBidStatus(bidderId: string, auctionId: string) {
    const [auction, highestBid, userBid] = await Promise.all([
      AuctionModel.findById(auctionId),
      BidModel.findOne({ auctionId, status: BID_STATUSES.ACTIVE }).sort({ amount: -1 }),
      BidModel.findOne({ auctionId, bidderId }).sort({ createdAt: -1 })
    ]);

    return {
      auctionStatus: auction?.status,
      currentHighestBid: auction?.highestBid,
      isHighestBidder: auction?.highestBidderId?.toString() === bidderId,
      yourLastBid: userBid?.amount || 0,
      bidStatus: userBid?.status
    };
  }
}
