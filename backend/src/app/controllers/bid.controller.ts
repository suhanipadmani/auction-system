import { Request, Response } from "express";
import { BidService } from "../services/bid.service";
import { sendSuccess } from "../utils/apiResponse";

/**
 * Place a manual bid.
 */
export const placeBid = async (req: Request, res: Response) => {
  const { auctionId, amount } = req.body;
  const bidderId = req.user!.id;
  const bid = await BidService.placeBid(bidderId, auctionId, amount);
  sendSuccess(res, "Bid placed successfully", bid, 201);
};

/**
 * Setup auto-bidding.
 */
export const setupAutoBid = async (req: Request, res: Response) => {
  const { auctionId, limit } = req.body;
  const bidderId = req.user!.id;
  const autoBid = await BidService.setupAutoBid(bidderId, auctionId, limit);
  sendSuccess(res, "Auto-bid setup successfully", autoBid, 201);
};

/**
 * Get bid status for current user on an auction.
 */
export const getBidStatus = async (req: Request, res: Response) => {
  const { auctionId } = req.params;
  const bidderId = req.user!.id;
  const status = await BidService.getBidStatus(bidderId, auctionId as string);
  sendSuccess(res, "Bid status retrieved", status);
};

/**
 * Admin-only: Remove a bid.
 */
export const removeBid = async (req: Request, res: Response) => {
  const { id } = req.params;
  const adminId = req.user!.id;
  const result = await BidService.removeBid(id as string, adminId);
  sendSuccess(res, "Bid removed successfully", result);
};
