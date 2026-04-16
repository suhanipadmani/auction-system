export type TransactionType = "credit" | "debit" | "lock" | "unlock";
export type TransactionStatus = "success" | "pending" | "failed";
export type TransactionSource = "deposit" | "admin" | "auction" | "withdrawal" | "manual";
export type IViewType = "overview" | "manual" | "history";


export interface IUserMinimal {
  _id: string;
  name: string;
  email: string;
}

export interface IDepositRequest {
  _id: string;
  userId: IUserMinimal;
  amount: number;
  status: Extract<TransactionStatus, "pending" | "approved" | "rejected"> | "approved" | "rejected";
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

