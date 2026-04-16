import { Request, Response } from "express";
import { AuctionService } from "../services/auction.service";

export class AuctionController {
  static async create(req: Request, res: Response) {
    const auction = await AuctionService.createAuction(req.user!.id, req.body);
    res.status(201).json({ success: true, data: auction });
  }

  static async update(req: Request, res: Response) {
    const { id } = req.params;
    const auction = await AuctionService.updateAuction(id as string, req.user!.id, req.body);
    res.status(200).json({ success: true, data: auction });
  }

  static async cancel(req: Request, res: Response) {
    const { id } = req.params;
    const auction = await AuctionService.cancelAuction(id as string, req.user!.id);
    res.status(200).json({ success: true, data: auction, message: "Auction cancelled successfully" });
  }

  static async getAll(req: Request, res: Response) {
    const { page, limit, ...filters } = req.query;
    const result = await AuctionService.getAuctions(filters, {
      page: Number(page) || 1,
      limit: Number(limit) || 10,
    });
    res.status(200).json({ success: true, ...result });
  }

  static async getById(req: Request, res: Response) {
    const { id } = req.params;
    const auction = await AuctionService.getAuctionById(id as string);
    res.status(200).json({ success: true, data: auction });
  }

  static async adminApproveAction(req: Request, res: Response) {
    const { id } = req.params;
    const { action } = req.body;
    const auction = await AuctionService.adminApproveReject(id as string, action);
    res.status(200).json({ success: true, data: auction, message: `Auction ${action}ed successfully` });
  }

  static async adminForceAction(req: Request, res: Response) {
    const { id } = req.params;
    const { action } = req.body; // "start" | "end"
    const auction = await AuctionService.forceAction(id as string, action);
    res.status(200).json({ success: true, data: auction, message: `Auction force ${action}ed` });
  }

  static async finalize(req: Request, res: Response) {
    const { id } = req.params;
    const auction = await AuctionService.finalizeAuction(id as string, req.user!.id);
    res.status(200).json({ success: true, data: auction, message: "Sale finalized and funds transferred successfully" });
  }

  static async getMyActivity(req: Request, res: Response) {
    const result = await AuctionService.getMyBiddingActivity(req.user!.id);
    res.status(200).json({ success: true, ...result });
  }

  static async getSellerStats(req: Request, res: Response) {
    const stats = await AuctionService.getSellerStats(req.user!.id);
    res.status(200).json({ success: true, data: stats });
  }

  static async getAdminStats(req: Request, res: Response) {
    const stats = await AuctionService.getAdminStats();
    res.status(200).json({ success: true, data: stats });
  }

  static async getAdminInventory(req: Request, res: Response) {
    const { page, limit, ...filters } = req.query;
    const result = await AuctionService.getAdminInventory(filters, {
      page: Number(page) || 1,
      limit: Number(limit) || 10,
    });
    res.status(200).json({ success: true, ...result });
  }
}

