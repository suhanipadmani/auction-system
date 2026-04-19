import { Types } from "mongoose";

import { DEPOSIT_STATUSES, TRANSACTION_TYPES, TRANSACTION_STATUSES, TRANSACTION_SOURCES } from "../enums";

import { runInTransaction } from "../utils/transaction";

import { getOrCreateWallet } from "./wallet.service";

import { UserModel } from "../models/user";
import { DepositRequestModel } from "../models/depositRequest";
import { TransactionModel } from "../models/transaction";
import { AuditLogModel } from "../models/auditLog";
import { AuditLogService } from "./auditLog.service";
import { AUDIT_ACTIONS } from "../enums";

/**
 * Lists deposit requests for admin review with optional status filtering
 */
export const getDepositRequests = async (status?: string, options: { page?: number; limit?: number } = {}) => {
  const { page = 1, limit = 20 } = options;
  const skip = (page - 1) * limit;
  const query = status ? { status } : {};

  const [data, total] = await Promise.all([
    DepositRequestModel.find(query)
      .populate("userId", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    DepositRequestModel.countDocuments(query),
  ]);

  return {
    data,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
};

/**
 * Processes a deposit request (Approve/Reject)
 */
export const processDepositRequest = async (
  requestId: string,
  status: DEPOSIT_STATUSES.APPROVED | DEPOSIT_STATUSES.REJECTED,
  adminId: string,
  adminNote?: string
) => {
  return await runInTransaction(async (session) => {
    const request = await DepositRequestModel.findById(requestId).session(session);
    if (!request) throw new Error("Deposit request not found");

    // Prevent Double Approval
    if (request.status !== "pending") throw new Error("Already processed");

    request.status = status;
    request.adminId = new Types.ObjectId(adminId);
    request.adminNote = adminNote || "";
    await request.save({ session });

    if (status === DEPOSIT_STATUSES.APPROVED) {
      const wallet = await getOrCreateWallet(request.userId.toString());

      // Block if Wallet Frozen
      if (wallet.isFrozen) throw new Error("Wallet is frozen");

      wallet.balance += request.amount;
      await wallet.save({ session });

      // All steps succeed or fail together
      await TransactionModel.create([{
        userId: request.userId,
        type: "credit",
        amount: request.amount,
        status: "success",
        referenceId: request._id,
        source: "deposit"
      }], { session });

      // Log mandatory event: Deposit Approved
      await AuditLogService.log(adminId, AUDIT_ACTIONS.WALLET_UPDATED, {
        type: "DEPOSIT_APPROVED",
        targetUserId: request.userId,
        amount: request.amount,
        requestId: request._id,
        newBalance: wallet.balance
      });
    }

    return request;
  });
};

/**
 * Manually adjusts a user's balance (Admin Override)
 */
export const adjustUserBalance = async (
  userId: string,
  amount: number,
  type: TRANSACTION_TYPES.CREDIT | TRANSACTION_TYPES.DEBIT,
  adminId: string,
  note: string
) => {
  return await runInTransaction(async (session) => {
    const wallet = await getOrCreateWallet(userId);
    
    // Check user role: Admins cannot have balance adjustments
    const user = await UserModel.findById(userId).session(session);
    if (user?.role === "admin") {
      throw new Error("Financial operations are restricted for administrative accounts");
    }

    // Safety check: Block adjustments on frozen wallets (Admin can override if policy changes)
    if (wallet.isFrozen) {
      throw new Error("Cannot adjust balance: Wallet is frozen");
    }

    if (type === TRANSACTION_TYPES.DEBIT) {
      if (wallet.balance < amount) throw new Error("Insufficient balance");
      wallet.balance -= amount;
    } else {
      wallet.balance += amount;
    }

    await wallet.save({ session });

    // Log transaction
    await TransactionModel.create([{
      userId: new Types.ObjectId(userId),
      type: type,
      amount: amount,
      status: TRANSACTION_STATUSES.SUCCESS,
      adminId: new Types.ObjectId(adminId),
      note: note,
      source: TRANSACTION_SOURCES.ADMIN
    }], { session });

    // Log mandatory event: Manual Adjustment
    await AuditLogService.log(adminId, AUDIT_ACTIONS.WALLET_UPDATED, {
      type: "MANUAL_ADJUSTMENT",
      targetUserId: userId,
      adjustmentType: type,
      amount: amount,
      note: note,
      newBalance: wallet.balance
    });

    return wallet;
  });
};

/**
 * Fetches all transactions in the system for admin audit with filtering
 */
export const getAllSystemTransactions = async (filters: {
  type?: string;
  source?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
}, options: { page?: number; limit?: number } = {}) => {
  const { page = 1, limit = 20 } = options;
  const skip = (page - 1) * limit;
  const query: any = {};

  if (filters.type && filters.type !== "all") {
    query.type = filters.type;
  }

  if (filters.source && filters.source !== "all") {
    query.source = filters.source;
  }

  if (filters.startDate || filters.endDate) {
    query.createdAt = {};
    if (filters.startDate) {
      query.createdAt.$gte = new Date(filters.startDate);
    }
    if (filters.endDate) {
      const end = new Date(filters.endDate);
      end.setHours(23, 59, 59, 999);
      query.createdAt.$lte = end;
    }
  }

  if (filters.search) {
    const users = await UserModel.find({
      $or: [
        { name: { $regex: filters.search, $options: "i" } },
        { email: { $regex: filters.search, $options: "i" } }
      ]
    }).select("_id");

    query.userId = { $in: users.map(u => u._id) };
  }

  const [data, total] = await Promise.all([
    TransactionModel.find(query)
      .populate("userId", "name email")
      .populate("adminId", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    TransactionModel.countDocuments(query),
  ]);

  return {
    data,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
};

/**
 * Context: Freeze/Unfreeze wallet with audit logging
 */
export const toggleWalletStatus = async (userId: string, isFrozen: boolean, adminId: string) => {
  const wallet = await getOrCreateWallet(userId);
  const previousStatus = wallet.isFrozen;
  wallet.isFrozen = isFrozen;
  await wallet.save();

  // Create audit log using centralized service
  await AuditLogService.log(adminId, AUDIT_ACTIONS.WALLET_UPDATED, {
    type: "WALLET_FREEZE_TOGGLE",
    targetUserId: userId,
    field: "isFrozen",
    oldValue: previousStatus,
    newValue: isFrozen
  });

  return wallet;
};

/**
 * Fetches a specific user's wallet detail for admin view
 */
export const getUserWalletDetail = async (userId: string) => {
  return await getOrCreateWallet(userId);
};
