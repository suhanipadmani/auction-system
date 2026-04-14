import { WalletModel } from "../models/wallet";
import { TransactionModel } from "../models/transaction";
import { DepositRequestModel } from "../models/depositRequest";
import { Types } from "mongoose";

/**
 * Ensures a user has a wallet and returns it
 */
export const getOrCreateWallet = async (userId: string) => {
  let wallet = await WalletModel.findOne({ userId });
  
  if (!wallet) {
    wallet = await WalletModel.create({
      userId: new Types.ObjectId(userId),
      balance: 0,
      lockedBalance: 0,
      isFrozen: false
    });
  }
  
  return wallet;
};

/**
 * Submits a new deposit request for admin approval
 */
export const createDepositRequest = async (userId: string, amount: number) => {
  if (amount <= 0) {
    throw new Error("Invalid deposit amount");
  }

  const wallet = await getOrCreateWallet(userId);
  
  if (wallet.isFrozen) {
    throw new Error("Wallet is frozen");
  }

  const request = await DepositRequestModel.create({
    userId: new Types.ObjectId(userId),
    amount,
    status: "pending"
  });

  return request;
};

/**
 * Fetches transaction history for a user
 */
export const getTransactionHistory = async (userId: string) => {
  return await TransactionModel.find({ userId })
    .sort({ createdAt: -1 });
};

/**
 * Fetches all deposit requests for a user (to show their request status)
 */
export const getDepositRequests = async (userId: string) => {
  return await DepositRequestModel.find({ userId })
    .sort({ createdAt: -1 });
};
