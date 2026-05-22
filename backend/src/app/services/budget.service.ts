import { Types } from "mongoose";
import { BudgetModel } from "../models/budget";
import { AuctionModel } from "../models/auction";
import { AppError, ErrorMessages } from "../errors";

export class BudgetService {
  /**
   * Creates a new bidding goal
   */
  static async createGoal(userId: string, name: string, maxBudget: number) {
    // Check if goal with same name exists
    const existing = await BudgetModel.findOne({ userId, name });
    if (existing) throw AppError.from(ErrorMessages.GOAL_ALREADY_EXISTS);

    return await BudgetModel.create({
      userId: new Types.ObjectId(userId),
      name,
      maxBudget
    });
  }

  /**
   * Gets all goals for a user with calculated exposure
   */
  static async getGoals(userId: string) {
    const goals = await BudgetModel.find({ userId }).populate("auctionIds");
    
    // Enrich with exposure
    const enrichedGoals = await Promise.all(goals.map(async (goal) => {
      const exposure = await this.calculateExposure(goal._id.toString(), userId);
      return {
        ...goal.toObject(),
        currentExposure: exposure
      };
    }));

    return enrichedGoals;
  }

  /**
   * Assigns an auction to a goal
   */
  static async assignAuctionToGoal(userId: string, goalId: string, auctionId: string) {
    // 1. Remove this auction from ANY other goal of this user first
    await BudgetModel.updateMany(
      { userId },
      { $pull: { auctionIds: new Types.ObjectId(auctionId) } }
    );

    // 2. Add to the target goal
    const goal = await BudgetModel.findOneAndUpdate(
      { _id: goalId, userId },
      { $addToSet: { auctionIds: new Types.ObjectId(auctionId) } },
      { new: true }
    );

    if (!goal) throw AppError.from(ErrorMessages.GOAL_NOT_FOUND);
    return goal;
  }

  static async unassignAuctionFromGoal(userId: string, auctionId: string) {
    await BudgetModel.updateMany(
      { userId },
      { $pull: { auctionIds: new Types.ObjectId(auctionId) } }
    );
    return true;
  }

  /**
   * Calculates current exposure for a goal (Sum of winning bids)
   */
  static async calculateExposure(goalId: string, userId: string) {
    const goal = await BudgetModel.findById(goalId);
    if (!goal) return 0;

    const winningAuctions = await AuctionModel.find({
      _id: { $in: goal.auctionIds },
      highestBidderId: new Types.ObjectId(userId),
      status: "active"
    });

    return winningAuctions.reduce((sum, auction) => sum + auction.highestBid, 0);
  }

  /**
   * Validates if a bid can be placed within the budget
   */
  static async validateBid(userId: string, auctionId: string, amount: number) {
    // Find if this auction is assigned to a goal
    const goal = await BudgetModel.findOne({
      userId,
      auctionIds: new Types.ObjectId(auctionId)
    });

    if (!goal) return true; // No goal assigned, no limit

    // Calculate current exposure (excluding this auction if we are already winning it)
    const otherWinningAuctions = await AuctionModel.find({
      _id: { $in: goal.auctionIds, $ne: new Types.ObjectId(auctionId) },
      highestBidderId: new Types.ObjectId(userId),
      status: "active"
    });

    const currentOtherExposure = otherWinningAuctions.reduce((sum, auction) => sum + auction.highestBid, 0);

    if (currentOtherExposure + amount > goal.maxBudget) {
      const remaining = goal.maxBudget - currentOtherExposure;
      throw AppError.from(ErrorMessages.BID_EXCEEDS_BUDGET(goal.name, remaining));
    }

    return true;
  }

  static async deleteGoal(goalId: string, userId: string) {
    const result = await BudgetModel.deleteOne({ _id: goalId, userId });
    if (result.deletedCount === 0) throw AppError.from(ErrorMessages.GOAL_NOT_FOUND);
    return true;
  }

  static async updateGoal(goalId: string, userId: string, data: any) {
    const goal = await BudgetModel.findOneAndUpdate(
        { _id: goalId, userId },
        { $set: data },
        { new: true }
    );
    if (!goal) throw AppError.from(ErrorMessages.GOAL_NOT_FOUND);
    return goal;
  }
}
