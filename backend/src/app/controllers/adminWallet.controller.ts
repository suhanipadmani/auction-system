import { Request, Response } from "express";
import * as AdminWalletService from "../services/adminWallet.service";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/apiResponse";
import { AppError } from "../utils/AppError";

export const getPendingDeposits = asyncHandler(async (req: Request, res: Response) => {
  const { status } = req.query;
  const requests = await AdminWalletService.getDepositRequests(status as string);
  sendSuccess(res, "Deposit requests retrieved", requests);
});

export const approveRejectDeposit = asyncHandler(async (req: Request, res: Response) => {
  const { requestId, status, adminNote } = req.body;
  const adminId = (req as any).user.id;

  if (!requestId || !["approved", "rejected"].includes(status)) {
    throw new AppError("Invalid request data", 400);
  }

  const result = await AdminWalletService.processDepositRequest(requestId, status, adminId, adminNote);
  sendSuccess(res, "Deposit request processed", result);
});

export const adjustBalance = asyncHandler(async (req: Request, res: Response) => {
  const { userId, amount, type, note } = req.body;
  const adminId = (req as any).user.id;

  if (!userId || !amount || !["credit", "debit"].includes(type)) {
    throw new AppError("Invalid adjustment data", 400);
  }

  const result = await AdminWalletService.adjustUserBalance(userId, amount, type, adminId, note);
  sendSuccess(res, "User balance adjusted", result);
});

export const freezeUnfreezeWallet = asyncHandler(async (req: Request, res: Response) => {
  const { userId, isFrozen } = req.body;
  const adminId = (req as any).user.id;

  if (!userId || typeof isFrozen !== "boolean") {
    throw new AppError("Invalid status data", 400);
  }

  const result = await AdminWalletService.toggleWalletStatus(userId, isFrozen, adminId);
  sendSuccess(res, "Wallet status updated", result);
});

export const getSystemTransactions = asyncHandler(async (req: Request, res: Response) => {
  const { type, source, search, startDate, endDate } = req.query;
  const transactions = await AdminWalletService.getAllSystemTransactions({
    type: type as string,
    source: source as string,
    search: search as string,
    startDate: startDate as string,
    endDate: endDate as string
  });
  sendSuccess(res, "System transactions retrieved", transactions);
});

export const getUserAdminWallet = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const wallet = await AdminWalletService.getUserWalletDetail(userId as string);
  sendSuccess(res, "User wallet details retrieved", wallet);
});
