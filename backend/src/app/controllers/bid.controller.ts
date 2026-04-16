import { Request, Response } from "express";
import { BidService } from "../services/bid.service";

export class BidController {
  /**
   * Place a manual bid.
   */
  static async placeBid(req: Request, res: Response) {
    try {
      const { auctionId, amount } = req.body;
      const bidderId = req.user?.id;

      if (!bidderId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const bid = await BidService.placeBid(bidderId, auctionId, amount);
      
      res.status(201).json({
        success: true,
        message: "Bid placed successfully",
        data: bid
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  /**
   * Setup auto-bidding.
   */
  static async setupAutoBid(req: Request, res: Response) {
    try {
      const { auctionId, limit } = req.body;
      const bidderId = req.user?.id;

      if (!bidderId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const autoBid = await BidService.setupAutoBid(bidderId, auctionId, limit);

      res.status(201).json({
        success: true,
        message: "Auto-bid setup successfully",
        data: autoBid
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  /**
   * Get bid status for current user on an auction.
   */
  static async getBidStatus(req: Request, res: Response) {
    try {
      const { auctionId } = req.params;
      const bidderId = req.user?.id;

      if (!bidderId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const status = await BidService.getBidStatus(bidderId, auctionId as string);

      res.status(200).json({
        success: true,
        data: status
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}
