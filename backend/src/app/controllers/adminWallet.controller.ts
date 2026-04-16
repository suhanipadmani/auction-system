// External
import { Request, Response } from "express";

// Enums
import { DEPOSIT_STATUSES, TRANSACTION_TYPES } from "../enums";

// utils
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/apiResponse";
import { AppError } from "../utils/AppError";

// Services
import * as AdminWalletService from "../services/adminWallet.service";

const VALID_DEPOSIT_ACTIONS = [DEPOSIT_STATUSES.APPROVED, DEPOSIT_STATUSES.REJECTED] as const;
const VALID_ADJUSTMENT_TYPES = [TRANSACTION_TYPES.CREDIT, TRANSACTION_TYPES.DEBIT] as const;

export const getPendingDeposits = asyncHandler(async (req: Request, res: Response) => {
  const { status } = req.query;
  const requests = await AdminWalletService.getDepositRequests(status as string);
  sendSuccess(res, "Deposit requests retrieved", requests);
});

export const approveRejectDeposit = asyncHandler(async (req: Request, res: Response) => {
  const { requestId, status, adminNote } = req.body;
  const adminId = (req as any).user.id;

  if (!requestId || !VALID_DEPOSIT_ACTIONS.includes(status)) {
    throw new AppError(
      `Invalid request data. Status must be one of: ${VALID_DEPOSIT_ACTIONS.join(", ")}`,
      400
    );
  }

  const result = await AdminWalletService.processDepositRequest(
    requestId,
    status as DEPOSIT_STATUSES.APPROVED | DEPOSIT_STATUSES.REJECTED,
    adminId,
    adminNote
  );
  sendSuccess(res, "Deposit request processed", result);
});

export const adjustBalance = asyncHandler(async (req: Request, res: Response) => {
  const { userId, amount, type, note } = req.body;
  const adminId = (req as any).user.id;

  if (!userId || !amount || !VALID_ADJUSTMENT_TYPES.includes(type)) {
    throw new AppError(
      `Invalid adjustment data. Type must be one of: ${VALID_ADJUSTMENT_TYPES.join(", ")}`,
      400
    );
  }

  const result = await AdminWalletService.adjustUserBalance(
    userId,
    amount,
    type as TRANSACTION_TYPES.CREDIT | TRANSACTION_TYPES.DEBIT,
    adminId,
    note
  );
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
    endDate: endDate as string,
  });
  sendSuccess(res, "System transactions retrieved", transactions);
});

export const getUserAdminWallet = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const wallet = await AdminWalletService.getUserWalletDetail(userId as string);
  sendSuccess(res, "User wallet details retrieved", wallet);
});
