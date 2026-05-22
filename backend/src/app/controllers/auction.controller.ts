import { Request, Response } from "express";
import { AuctionService } from "../services/auction.service";
import { AuctionStatsService } from "../services/auction-stats.service";
import { sendSuccess } from "../utils/apiResponse";
import { getPagingMeta } from "../utils/pagination";
import { SuccessMessages } from "../constants/successMessages";

export const createAuction = async (req: Request, res: Response) => {
  const auction = await AuctionService.createAuction(req.user!.id, req.body);
  sendSuccess(res, SuccessMessages.AUCTION_CREATED, auction, 201);
};

export const updateAuction = async (req: Request, res: Response) => {
  const { id } = req.params;
  const auction = await AuctionService.updateAuction(id as string, req.user!.id, req.body);
  sendSuccess(res, SuccessMessages.AUCTION_UPDATED, auction);
};

export const cancelAuction = async (req: Request, res: Response) => {
  const { id } = req.params;
  const auction = await AuctionService.cancelAuction(id as string, req.user as any);
  sendSuccess(res, SuccessMessages.AUCTION_CANCELLED, auction);
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
  const message = action === 'approve' ? SuccessMessages.AUCTION_APPROVED : SuccessMessages.AUCTION_REJECTED;
  sendSuccess(res, message, auction);
};

export const forceAction = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { action } = req.body;
  const auction = await AuctionService.forceAction(id as string, action);
  const message = action === 'start' ? SuccessMessages.AUCTION_STARTED : SuccessMessages.AUCTION_ENDED;
  sendSuccess(res, message, auction);
};

export const finalizeAuction = async (req: Request, res: Response) => {
  const { id } = req.params;
  const auction = await AuctionService.finalizeAuction(id as string, req.user!.id);
  sendSuccess(res, SuccessMessages.AUCTION_FINALIZED, auction);
};

export const getMyActivity = async (req: Request, res: Response) => {
  const { page, limit, tab, search, sortBy, sortOrder } = req.query;
  const result = await AuctionService.getMyBiddingActivity(req.user!.id, {
    page: Number(page) || 1,
    limit: Number(limit) || 20,
    tab: tab as string,
    search: search as string,
    sortBy: sortBy as string,
    sortOrder: sortOrder as any
  });
  sendSuccess(res, "Bidding activity retrieved", result, 200, getPagingMeta(result.total, result.page, Number(limit) || 20));
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
  const { page, limit } = (req as any).pagination;
  const result = await AuctionService.getAuctionBids(id as string, { page, limit }, req.user?.id, req.user?.role);
  sendSuccess(res, "Bids retrieved", result.data, 200, getPagingMeta(result.total, page, limit));
};


