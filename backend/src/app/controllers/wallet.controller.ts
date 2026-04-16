import { Request, Response } from "express";

// Utils 
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/apiResponse";
import { AppError } from "../utils/AppError";

// Services 
import * as WalletService from "../services/wallet.service";

export const getWallet = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const wallet = await WalletService.getOrCreateWallet(userId);
  sendSuccess(res, "Wallet retrieved", wallet);
});

export const requestDeposit = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { amount } = req.body;
  
  if (!amount || amount <= 0) {
    throw new AppError("Invalid deposit amount", 400);
  }

  const request = await WalletService.createDepositRequest(userId, amount);
  sendSuccess(res, "Deposit request submitted", request, 201);
});

export const getTransactions = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const transactions = await WalletService.getTransactionHistory(userId);
  sendSuccess(res, "Transactions retrieved", transactions);
});

export const getMyRequests = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const requests = await WalletService.getDepositRequests(userId);
  sendSuccess(res, "Deposit requests retrieved", requests);
});
