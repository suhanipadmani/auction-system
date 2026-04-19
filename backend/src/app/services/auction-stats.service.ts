import { Types } from "mongoose";
import { AuctionModel } from "../models/auction";
import { UserModel } from "../models/user";
import { BidModel } from "../models/bid";
import { AUCTION_STATUSES } from "../enums";
import { IAuctionFilters, IPaginationOptions } from "../types/auction";

export class AuctionStatsService {
  /**
   * Aggregates stats for a specific seller.
   */
  static async getSellerStats(userId: string) {
    const [activeCount, soldCount, aggregationResult] = await Promise.all([
      AuctionModel.countDocuments({ sellerId: userId, status: AUCTION_STATUSES.ACTIVE }),
      AuctionModel.countDocuments({ sellerId: userId, status: AUCTION_STATUSES.SOLD }),
      AuctionModel.aggregate([
        { $match: { sellerId: new Types.ObjectId(userId) } },
        {
          $group: {
            _id: null,
            totalEarnings: {
              $sum: { $cond: [{ $eq: ["$status", AUCTION_STATUSES.SOLD] }, "$highestBid", 0] }
            },
            totalCreated: { $sum: 1 },
            totalSold: { $sum: { $cond: [{ $eq: ["$status", AUCTION_STATUSES.SOLD] }, 1, 0] } },
            avgHighestBid: { $avg: { $cond: [{ $gt: ["$highestBid", 0] }, "$highestBid", null] } },
            maxBidReceived: { $max: "$highestBid" }
          }
        }
      ])
    ]);

    const agg = aggregationResult[0] || { totalEarnings: 0, totalCreated: 0, totalSold: 0, avgHighestBid: 0, maxBidReceived: 0 };
    const successRate = agg.totalCreated > 0 ? (agg.totalSold / agg.totalCreated) * 100 : 0;

    return {
      activeListings: activeCount,
      completedSales: soldCount,
      totalEarnings: agg.totalEarnings,
      successRate: Math.round(successRate),
      avgHighestBid: Math.round(agg.avgHighestBid || 0),
      maxBidReceived: agg.maxBidReceived || 0
    };
  }

  /**
   * Aggregates administrative stats for the entire platform.
   */
  static async getAdminStats() {
    const [totalAuctions, revenueResult, activeUsersCount, totalUsersCount] = await Promise.all([
      AuctionModel.countDocuments(),
      AuctionModel.aggregate([
        { $match: { status: AUCTION_STATUSES.SOLD } },
        { $group: { _id: null, total: { $sum: "$highestBid" } } }
      ]),
      // Utilizing the model from mongoose here as it might not be imported/exported correctly elsewhere
      (AuctionModel as any).db.model("User").countDocuments({ status: "active", role: { $ne: "admin" } }),
      (AuctionModel as any).db.model("User").countDocuments({ role: { $ne: "admin" } })
    ]);

    return {
      totalAuctions,
      systemRevenue: revenueResult[0]?.total || 0,
      activeUsersCount,
      totalUsersCount
    };
  }

  /**
   * Aggregates public metrics for the landing page.
   */
  static async getPublicStats() {
    const [totalAuctions, activeAuctions, totalBids, activeBidders] = await Promise.all([
      AuctionModel.countDocuments(),
      AuctionModel.countDocuments({ status: AUCTION_STATUSES.ACTIVE }),
      BidModel.countDocuments(),
      BidModel.aggregate([
        { $group: { _id: "$bidderId" } },
        { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "user" } },
        { $unwind: "$user" },
        { $match: { "user.role": { $ne: "admin" } } },
        { $count: "count" }
      ]).then(res => res[0]?.count || 0)
    ]);

    const volumeResult = await AuctionModel.aggregate([
      { $match: { status: { $in: [AUCTION_STATUSES.SOLD, AUCTION_STATUSES.ENDED] } } },
      { $group: { _id: null, total: { $sum: "$highestBid" } } }
    ]);

    return {
      totalAuctions,
      activeAuctions,
      totalBids,
      activeBidders,
      totalVolume: volumeResult[0]?.total || 0,
      timestamp: Date.now()
    };
  }

  /**
   * Fetches the administration inventory with filtering and search.
   */
  static async getAdminInventory(filters: IAuctionFilters, options: IPaginationOptions) {
    const { page = 1, limit = 20 } = options;
    const skip = (page - 1) * limit;

    const { search, ...otherFilters } = filters;
    const query: any = { ...otherFilters };

    if (search) {
      const matchingSellers = await UserModel.find({
        name: { $regex: search, $options: "i" }
      }).select("_id");

      const sellerIds = matchingSellers.map((s: any) => s._id);

      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
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
