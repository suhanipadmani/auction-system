export enum TRANSACTION_TYPES {
  CREDIT = "credit",
  DEBIT = "debit",
  LOCK = "lock",
  UNLOCK = "unlock",
}

export enum TRANSACTION_STATUSES {
  SUCCESS = "success",
  PENDING = "pending",
  FAILED = "failed",
  APPROVED = "approved",
  REJECTED = "rejected",
}

export enum TRANSACTION_SOURCES {
  DEPOSIT = "deposit",
  ADMIN = "admin",
  AUCTION = "auction",
  WITHDRAWAL = "withdrawal",
  MANUAL = "manual",
  BID = "bid",
}

export enum WALLET_VIEW_TYPES {
  OVERVIEW = "overview",
  MANUAL = "manual",
  HISTORY = "history",
}
