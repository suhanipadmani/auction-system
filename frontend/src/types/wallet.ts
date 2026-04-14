export interface IUserMinimal {
  _id: string;
  name: string;
  email: string;
}

export interface IDepositRequest {
  _id: string;
  userId: IUserMinimal;
  amount: number;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  updatedAt: string;
}

export interface ITransaction {
  _id: string;
  userId: IUserMinimal;
  adminId?: IUserMinimal;
  amount: number;
  type: "credit" | "debit" | "lock" | "unlock";
  source: "deposit" | "admin" | "auction" | "withdrawal";
  status: "success" | "pending" | "failed";
  note?: string;
  referenceId?: string;
  createdAt: string;
}
