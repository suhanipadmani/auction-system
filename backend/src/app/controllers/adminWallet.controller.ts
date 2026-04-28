import { Request, Response } from "express";
import { DEPOSIT_STATUSES, TRANSACTION_TYPES, PAYOUT_STATUSES } from "../enums";
import * as AdminWalletService from "../services/adminWallet.service";
import { sendSuccess } from "../utils/apiResponse";
import { AppError, ErrorMessages } from "../errors";
import { getPagingMeta } from "../utils/pagination";

const VALID_DEPOSIT_ACTIONS = [DEPOSIT_STATUSES.APPROVED, DEPOSIT_STATUSES.REJECTED] as const;
const VALID_PAYOUT_ACTIONS = [PAYOUT_STATUSES.APPROVED, PAYOUT_STATUSES.REJECTED] as const;
const VALID_ADJUSTMENT_TYPES = [TRANSACTION_TYPES.CREDIT, TRANSACTION_TYPES.DEBIT] as const;

export const getPendingDeposits = async (req: Request, res: Response) => {
  const { status } = req.query;
  const { page, limit } = (req as any).pagination;
  const result = await AdminWalletService.getDepositRequests(status as string, { page, limit });
  sendSuccess(res, "Deposit requests retrieved", result.data, 200, getPagingMeta(result.total, page, limit));
};

export const approveRejectDeposit = async (req: Request, res: Response) => {
  const { requestId, status, adminNote } = req.body;
  const adminId = req.user!.id;

  if (!requestId || !VALID_DEPOSIT_ACTIONS.includes(status)) {
    throw AppError.from(ErrorMessages.CUSTOM_VALIDATION(
      `Invalid request data. Status must be one of: ${VALID_DEPOSIT_ACTIONS.join(", ")}`
    ));
  }

  const result = await AdminWalletService.processDepositRequest(
    requestId,
    status as DEPOSIT_STATUSES.APPROVED | DEPOSIT_STATUSES.REJECTED,
    adminId,
    adminNote
  );
  sendSuccess(res, "Deposit request processed", result);
};

export const adjustBalance = async (req: Request, res: Response) => {
  const { userId, amount, type, note } = req.body;
  const adminId = req.user!.id;

  if (!userId || !amount || !VALID_ADJUSTMENT_TYPES.includes(type)) {
    throw AppError.from(ErrorMessages.CUSTOM_VALIDATION(
      `Invalid adjustment data. Type must be one of: ${VALID_ADJUSTMENT_TYPES.join(", ")}`
    ));
  }

  const result = await AdminWalletService.adjustUserBalance(
    userId,
    amount,
    type as TRANSACTION_TYPES.CREDIT | TRANSACTION_TYPES.DEBIT,
    adminId,
    note
  );
  sendSuccess(res, "User balance adjusted", result);
};

export const freezeUnfreezeWallet = async (req: Request, res: Response) => {
  const { userId, isFrozen } = req.body;
  const adminId = req.user!.id;

  if (!userId || typeof isFrozen !== "boolean") {
    throw AppError.from(ErrorMessages.CUSTOM_VALIDATION("Invalid status data"));
  }

  const result = await AdminWalletService.toggleWalletStatus(userId, isFrozen, adminId);
  sendSuccess(res, "Wallet status updated", result);
};

export const getSystemTransactions = async (req: Request, res: Response) => {
  const { type, source, search, startDate, endDate } = req.query;
  const { page, limit } = (req as any).pagination;

  const result = await AdminWalletService.getAllSystemTransactions({
    type: type as string,
    source: source as string,
    search: search as string,
    startDate: startDate as string,
    endDate: endDate as string,
  }, { page, limit });
  
  sendSuccess(res, "System transactions retrieved", result.data, 200, getPagingMeta(result.total, page, limit));
};

export const getUserAdminWallet = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const wallet = await AdminWalletService.getUserWalletDetail(userId as string);
  sendSuccess(res, "User wallet details retrieved", wallet);
};

export const getPayoutRequests = async (req: Request, res: Response) => {
  const { status } = req.query;
  const { page, limit } = (req as any).pagination;
  const result = await AdminWalletService.getPayoutRequests(status as string, { page, limit });
  sendSuccess(res, "Payout requests retrieved", result.data, 200, getPagingMeta(result.total, page, limit));
};

export const approveRejectPayout = async (req: Request, res: Response) => {
  const { requestId, status, adminNote } = req.body;
  const adminId = req.user!.id;

  if (!requestId || !VALID_PAYOUT_ACTIONS.includes(status)) {
    throw AppError.from(ErrorMessages.CUSTOM_VALIDATION(
      `Invalid request data. Status must be one of: ${VALID_PAYOUT_ACTIONS.join(", ")}`
    ));
  }

  const result = await AdminWalletService.processPayoutRequest(
    requestId,
    status as PAYOUT_STATUSES.APPROVED | PAYOUT_STATUSES.REJECTED,
    adminId,
    adminNote
  );
  sendSuccess(res, "Payout request processed", result);
};
