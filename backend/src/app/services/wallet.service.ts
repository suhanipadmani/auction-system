import { Types, ClientSession } from "mongoose";
import { WalletModel } from "../models/wallet";
import { UserModel } from "../models/user";
import { TransactionModel } from "../models/transaction";
import { DepositRequestModel } from "../models/depositRequest";
import { PayoutRequestModel } from "../models/payoutRequest";
import { TRANSACTION_SOURCES, TRANSACTION_STATUSES, TRANSACTION_TYPES, AUDIT_ACTIONS, NOTIFICATION_TYPES, PAYOUT_STATUSES } from "../enums";
import { AppError } from "../utils/AppError";
import { AuditLogService } from "./auditLog.service";
import { NotificationService } from "./notification.service";
import { runInTransaction } from "../utils/transaction";

/**
 * Ensures a user has a wallet and returns it
 */
export const getOrCreateWallet = async (userId: string, session?: ClientSession | null) => {
  let wallet = session 
    ? await WalletModel.findOne({ userId }).session(session)
    : await WalletModel.findOne({ userId });
  
  if (!wallet) {
    const [newWallet] = await WalletModel.create([{
      userId: new Types.ObjectId(userId),
      balance: 0,
      lockedBalance: 0,
      isFrozen: false
    }], { session });
    wallet = newWallet;
  }
  
  return wallet;
};

/**
 * Submits a new deposit request for admin approval
 */
export const createDepositRequest = async (userId: string, amount: number) => {
  if (amount <= 0) {
    throw new AppError("Invalid deposit amount", 400);
  }

  const wallet = await getOrCreateWallet(userId);
  const user = await UserModel.findById(userId).select("name");
  
  if (wallet.isFrozen) {
    throw new AppError("Wallet is frozen", 403);
  }

  const request = await DepositRequestModel.create({
    userId: new Types.ObjectId(userId),
    amount,
    status: "pending"
  });

  // Notify ALL Admins for deposit review request
  await NotificationService.notifyAdmins(
    NOTIFICATION_TYPES.DEPOSIT_REQUEST,
    `New Deposit Request: ${user?.name || "A user"} has requested ₹${amount} deposit approval.`,
    `/admin/wallet`
  );

  return request;
};

/**
 * Fetches transaction history for a user
 */
export const getTransactionHistory = async (userId: string, options: { page?: number; limit?: number } = {}) => {
  const { page = 1, limit = 20 } = options;
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    TransactionModel.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    TransactionModel.countDocuments({ userId }),
  ]);

  return {
    data,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
};

/**
 * Fetches all deposit requests for a user (to show their request status)
 */
export const getDepositRequests = async (userId: string, options: { page?: number; limit?: number } = {}) => {
  const { page = 1, limit = 20 } = options;
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    DepositRequestModel.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    DepositRequestModel.countDocuments({ userId }),
  ]);

  return {
    data,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
};

/**
 * Locks funds for a user when they place a bid.
 * Moves money from balance to lockedBalance.
 */
export const lockFunds = async (userId: string, amount: number, session?: ClientSession | null) => {
  const wallet = await getOrCreateWallet(userId, session);
  
  if (wallet.balance < amount) {
    throw new AppError("Insufficient balance", 400);
  }

  wallet.balance -= amount;
  wallet.lockedBalance += amount;
  
  await wallet.save({ session });

  // Log mandatory wallet event
  await AuditLogService.log(userId, AUDIT_ACTIONS.WALLET_UPDATED, {
    type: "LOCKED_FUNDS",
    amount,
    reason: "Bidding on auction",
    newBalance: wallet.balance,
    newLockedBalance: wallet.lockedBalance
  });

  // Create Transaction Record for visible history
  await TransactionModel.create([{
    userId: new Types.ObjectId(userId),
    amount,
    type: TRANSACTION_TYPES.LOCK,
    source: TRANSACTION_SOURCES.BID,
    status: TRANSACTION_STATUSES.SUCCESS,
    note: "Funds locked for bidding"
  }], { session });

  return wallet;
};

/**
 * Unlocks funds for a user when they are outbid.
 * Moves money from lockedBalance back to balance.
 */
export const unlockFunds = async (userId: string, amount: number, session?: ClientSession | null) => {
  const wallet = await getOrCreateWallet(userId, session);
  
  // We don't throw if lockedBalance is less, to keep it robust, 
  // but logically it should always be >= amount
  const actualToUnlock = Math.min(wallet.lockedBalance, amount);
  
  wallet.balance += actualToUnlock;
  wallet.lockedBalance -= actualToUnlock;
  
  await wallet.save({ session });

  // Log mandatory wallet event
  await AuditLogService.log(userId, AUDIT_ACTIONS.WALLET_UPDATED, {
    type: "UNLOCKED_FUNDS",
    amount: actualToUnlock,
    reason: "Outbid or Auction Ended",
    newBalance: wallet.balance,
    newLockedBalance: wallet.lockedBalance
  });

  // Create Transaction Record for visible history
  await TransactionModel.create([{
    userId: new Types.ObjectId(userId),
    amount: actualToUnlock,
    type: TRANSACTION_TYPES.UNLOCK,
    source: TRANSACTION_SOURCES.BID,
    status: TRANSACTION_STATUSES.SUCCESS,
    note: "Funds unlocked (Outbid/Ended)"
  }], { session });

  return wallet;
};

/**
 * Completes the transfer of funds from winner to seller.
 * Deducts from winner's lockedBalance and adds to seller's balance.
 */
export const completeTransfer = async (
  winnerId: string, 
  sellerId: string, 
  amount: number, 
  auctionTitle: string,
  session?: ClientSession | null
) => {
  try {
    // 1. Get wallets with session
    const winnerWallet = await getOrCreateWallet(winnerId, session);
    const sellerWallet = await getOrCreateWallet(sellerId, session);

    // 2. Deduct from winner's locked balance
    if (winnerWallet.lockedBalance < amount) {
      console.warn(`[WALLET] Winner ${winnerId} has insufficient locked balance (${winnerWallet.lockedBalance}) for amount ${amount}`);
      // We still proceed if it's very close (rounding) or throw if it's a major gap
      if (winnerWallet.lockedBalance + 1 < amount) {
         throw new AppError("Insufficient locked funds for settlement", 400);
      }
    }
    winnerWallet.lockedBalance = Math.max(0, winnerWallet.lockedBalance - amount);
    await winnerWallet.save({ session });

    // 3. Add to seller's balance
    sellerWallet.balance = Number((sellerWallet.balance + amount).toFixed(2));
    await sellerWallet.save({ session });

    // 4. Create transactions
    await TransactionModel.insertMany([
      {
        userId: new Types.ObjectId(winnerId),
        amount,
        type: TRANSACTION_TYPES.DEBIT,
        source: TRANSACTION_SOURCES.BID,
        status: TRANSACTION_STATUSES.SUCCESS,
        note: `Final payment for auction: ${auctionTitle}`
      },
      {
        userId: new Types.ObjectId(sellerId),
        amount,
        type: TRANSACTION_TYPES.CREDIT,
        source: TRANSACTION_SOURCES.BID,
        status: TRANSACTION_STATUSES.SUCCESS,
        note: `Sale proceeds for auction: ${auctionTitle}`
      }
    ], { session });

    // Log mandatory settlement events
    await AuditLogService.log(winnerId, AUDIT_ACTIONS.WALLET_UPDATED, {
      type: "AUCTION_SETTLEMENT_PAYMENT",
      amount,
      auctionTitle,
      newLockedBalance: winnerWallet.lockedBalance
    });

    await AuditLogService.log(sellerId, AUDIT_ACTIONS.WALLET_UPDATED, {
      type: "AUCTION_SETTLEMENT_RECEIPT",
      amount,
      auctionTitle,
      newBalance: sellerWallet.balance
    });

    return { winnerWallet, sellerWallet };
  } catch (error: any) {
    if (error instanceof AppError) throw error;
    throw new AppError(error.message || "Wallet transfer failed", error.statusCode || 500);
  }
};

/**
 * Submits a new payout request for admin approval.
 * Locks the requested amount in the user's wallet.
 */
export const createPayoutRequest = async (userId: string, amount: number) => {
  if (amount <= 0) {
    throw new AppError("Invalid payout amount", 400);
  }

  return await runInTransaction(async (session) => {
    // 1. Lock funds
    await lockFunds(userId, amount, session);

    // 2. Create Request
    const request = await PayoutRequestModel.create([{
      userId: new Types.ObjectId(userId),
      amount,
      status: PAYOUT_STATUSES.PENDING
    }], { session });

    // 3. Notify Admins
    const user = await UserModel.findById(userId).select("name role");
    await NotificationService.notifyAdmins(
      NOTIFICATION_TYPES.PAYOUT_REQUEST,
      `New Payout Request: ${user?.name || "A user"} (${user?.role || "user"}) has requested a withdrawal of ₹${amount}.`,
      `/admin/payouts`
    );

    return request[0];
  });
};

/**
 * Fetches payout requests for a user
 */
export const getPayoutRequests = async (userId: string, options: { page?: number; limit?: number } = {}) => {
  const { page = 1, limit = 20 } = options;
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    PayoutRequestModel.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    PayoutRequestModel.countDocuments({ userId }),
  ]);

  return {
    data,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
};
