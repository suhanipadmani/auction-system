import { Request, Response } from "express";
import * as WalletService from "../services/wallet.service";
import { sendSuccess } from "../utils/apiResponse";
import { AppError } from "../utils/AppError";
import { getPagingMeta } from "../utils/pagination";

export const getWallet = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const wallet = await WalletService.getOrCreateWallet(userId);
  sendSuccess(res, "Wallet retrieved", wallet);
};

export const requestDeposit = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { amount } = req.body;
  
  if (!amount || amount <= 0) {
    throw new AppError("Invalid deposit amount", 400);
  }

  const request = await WalletService.createDepositRequest(userId, amount);
  sendSuccess(res, "Deposit request submitted", request, 201);
};

export const getTransactions = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { page, limit } = (req as any).pagination;
  
  const result = await WalletService.getTransactionHistory(userId, { page, limit });
  sendSuccess(res, "Transactions retrieved", result.data, 200, getPagingMeta(result.total, page, limit));
};

export const getMyRequests = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { page, limit } = (req as any).pagination;

  const result = await WalletService.getDepositRequests(userId, { page, limit });
  sendSuccess(res, "Deposit requests retrieved", result.data, 200, getPagingMeta(result.total, page, limit));
};
