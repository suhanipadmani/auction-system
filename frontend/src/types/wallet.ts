import { TRANSACTION_TYPES, TRANSACTION_STATUSES, TRANSACTION_SOURCES, WALLET_VIEW_TYPES } from "@/enums/wallet.enum";

export type TransactionType = TRANSACTION_TYPES;
export type TransactionStatus = TRANSACTION_STATUSES;
export type TransactionSource = TRANSACTION_SOURCES;
export type IViewType = WALLET_VIEW_TYPES;


export interface IUserMinimal {
  _id: string;
  name: string;
  email: string;
}

export interface IDepositRequest {
  _id: string;
  userId: IUserMinimal;
  amount: number;
  adminNote?: string;
  status: Extract<TransactionStatus, "pending" | "approved" | "rejected"> | "approved" | "rejected";
  createdAt: string;
  updatedAt: string;
}

export interface IPayoutRequest {
  _id: string;
  userId: IUserMinimal;
  amount: number;
  adminNote?: string;
  status: "approved" | "pending" | "rejected";
  createdAt: string;
  updatedAt: string;
}

export interface ITransaction {
  _id: string;
  userId: IUserMinimal;
  adminId?: IUserMinimal;
  amount: number;
  type: TransactionType;
  source: TransactionSource;
  status: TransactionStatus;
  note?: string;
  referenceId?: string;
  createdAt: string;
}

export interface IAdjustmentData {
  userId: string;
  amount: number;
  type: TRANSACTION_TYPES.CREDIT | TRANSACTION_TYPES.DEBIT;
  note: string;
  userName: string;
}
