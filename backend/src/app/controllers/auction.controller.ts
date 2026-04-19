import { Request, Response } from "express";
import { AuctionService } from "../services/auction.service";
import { AuctionStatsService } from "../services/auction-stats.service";
import { sendSuccess } from "../utils/apiResponse";
import { getPagingMeta } from "../utils/pagination";

export const createAuction = async (req: Request, res: Response) => {
  const auction = await AuctionService.createAuction(req.user!.id, req.body);
  sendSuccess(res, "Auction created successfully", auction, 201);
};

export const updateAuction = async (req: Request, res: Response) => {
  const { id } = req.params;
  const auction = await AuctionService.updateAuction(id as string, req.user!.id, req.body);
  sendSuccess(res, "Auction updated successfully", auction);
};

export const cancelAuction = async (req: Request, res: Response) => {
  const { id } = req.params;
  const auction = await AuctionService.cancelAuction(id as string, req.user as any);
  sendSuccess(res, "Auction cancelled successfully", auction);
};

export const getAuctions = async (req: Request, res: Response) => {
  const { page, limit, sort, sortBy, sortOrder } = (req as any).pagination;
  const filters = { ...req.query };
  delete filters.page;
  delete filters.limit;
  delete filters.sortBy;
  delete filters.sortOrder;

  const result = await AuctionService.getAuctions(filters as any, { page, limit, sortBy, sortOrder });
  sendSuccess(res, "Auctions retrieved", result.data, 200, getPagingMeta(result.total, page, limit));
};

export const getAuctionById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const auction = await AuctionService.getAuctionById(id as string);
  sendSuccess(res, "Auction details retrieved", auction);
};

export const approveRejectAuction = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { action } = req.body;
  const auction = await AuctionService.adminApproveReject(id as string, action);
  sendSuccess(res, `Auction ${action}ed successfully`, auction);
};

export const forceAction = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { action } = req.body;
  const auction = await AuctionService.forceAction(id as string, action);
  sendSuccess(res, `Auction force ${action}ed`, auction);
};

export const finalizeAuction = async (req: Request, res: Response) => {
  const { id } = req.params;
  const auction = await AuctionService.finalizeAuction(id as string, req.user!.id);
  sendSuccess(res, "Sale finalized successfully", auction);
};

export const getMyActivity = async (req: Request, res: Response) => {
  const { page, limit, tab } = req.query;
  const result = await AuctionService.getMyBiddingActivity(req.user!.id, {
    page: Number(page) || 1,
    limit: Number(limit) || 20,
    tab: tab as string
  });
  sendSuccess(res, "Bidding activity retrieved", result.data, 200, getPagingMeta(result.total, result.page, 20)); // limit fixed to 20 or as per result
};

export const getSellerStats = async (req: Request, res: Response) => {
  const stats = await AuctionStatsService.getSellerStats(req.user!.id);
  sendSuccess(res, "Seller stats retrieved", stats);
};

export const getAdminStats = async (req: Request, res: Response) => {
  const stats = await AuctionStatsService.getAdminStats();
  sendSuccess(res, "Admin stats retrieved", stats);
};

export const getPublicStats = async (req: Request, res: Response) => {
  const stats = await AuctionStatsService.getPublicStats();
  sendSuccess(res, "Public stats retrieved", stats);
};

export const getAdminInventory = async (req: Request, res: Response) => {
  const { page, limit } = (req as any).pagination;
  const filters = { ...req.query };
  delete filters.page;
  delete filters.limit;

  const result = await AuctionStatsService.getAdminInventory(filters as any, { page, limit });
  sendSuccess(res, "Admin inventory retrieved", result.data, 200, getPagingMeta(result.total, page, limit));
};

export const getAuctionBids = async (req: Request, res: Response) => {
  const { id } = req.params;
  const bids = await AuctionService.getAuctionBids(id as string, req.user?.id, req.user?.role);
  sendSuccess(res, "Bids retrieved", bids);
};

