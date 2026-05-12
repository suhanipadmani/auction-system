import { IErrorDefinition } from "../types/error";

export const ErrorMessages = {
  // Auth Errors
  UNAUTHORIZED: {
    message: "Unauthorized access. Please login.",
    statusCode: 401,
    errorCode: "AUTH_UNAUTHORIZED",
    category: "AUTH",
  } as IErrorDefinition,
  FORBIDDEN: {
    message: "You do not have permission to perform this action.",
    statusCode: 403,
    errorCode: "AUTH_FORBIDDEN",
    category: "AUTH",
  } as IErrorDefinition,
  INVALID_TOKEN: {
    message: "Invalid or expired token.",
    statusCode: 401,
    errorCode: "AUTH_INVALID_TOKEN",
    category: "AUTH",
  } as IErrorDefinition,

  // Resource Errors
  NOT_FOUND: {
    message: "The requested resource was not found.",
    statusCode: 404,
    errorCode: "RESOURCE_NOT_FOUND",
    category: "RESOURCE",
  } as IErrorDefinition,
  BAD_REQUEST: {
    message: "Invalid request parameters.",
    statusCode: 400,
    errorCode: "BAD_REQUEST",
    category: "RESOURCE",
  } as IErrorDefinition,
  DUPLICATE_ENTRY: {
    message: "Resource already exists.",
    statusCode: 400,
    errorCode: "RESOURCE_ALREADY_EXISTS",
    category: "RESOURCE",
  } as IErrorDefinition,

  // Validation Errors
  VALIDATION_ERROR: {
    message: "Validation failed.",
    statusCode: 400,
    errorCode: "VALIDATION_ERROR",
    category: "VALIDATION",
  } as IErrorDefinition,

  CUSTOM_VALIDATION: (msg: string): IErrorDefinition => ({
    message: msg,
    statusCode: 400,
    errorCode: "VALIDATION_ERROR",
    category: "VALIDATION",
  }),

  // Server Errors
  INTERNAL_SERVER_ERROR: {
    message: "Something went wrong on our end. Please try again later.",
    statusCode: 500,
    errorCode: "INTERNAL_SERVER_ERROR",
    category: "SERVER",
  } as IErrorDefinition,

  // Auth & Account Errors
  USER_ALREADY_EXISTS: {
    message: "User already exists with this email.",
    statusCode: 400,
    errorCode: "AUTH_USER_ALREADY_EXISTS",
    category: "AUTH",
  } as IErrorDefinition,
  INVALID_CREDENTIALS: {
    message: "Invalid email or password.",
    statusCode: 401,
    errorCode: "AUTH_INVALID_CREDENTIALS",
    category: "AUTH",
  } as IErrorDefinition,
  ACCOUNT_DEACTIVATED: {
    message: "Your account has been deactivated. Please contact support.",
    statusCode: 403,
    errorCode: "AUTH_ACCOUNT_DEACTIVATED",
    category: "AUTH",
  } as IErrorDefinition,
  ACCOUNT_DELETED: {
    message: "This account no longer exists.",
    statusCode: 404,
    errorCode: "AUTH_ACCOUNT_DELETED",
    category: "AUTH",
  } as IErrorDefinition,
  INVALID_RESET_TOKEN: {
    message: "Password reset token is invalid or has expired.",
    statusCode: 400,
    errorCode: "AUTH_INVALID_RESET_TOKEN",
    category: "AUTH",
  } as IErrorDefinition,

  // Feature specific errors
  AUCTION_NOT_FOUND: {
    message: "Auction listing not found.",
    statusCode: 404,
    errorCode: "AUCTION_NOT_FOUND",
    category: "AUCTION",
  } as IErrorDefinition,
  AUCTION_NOT_OWNER: {
    message: "Unauthorized: You do not own this auction.",
    statusCode: 403,
    errorCode: "AUCTION_NOT_OWNER",
    category: "AUCTION",
  } as IErrorDefinition,
  AUCTION_ALREADY_STARTED: {
    message: "Cannot edit auction after it has started.",
    statusCode: 400,
    errorCode: "AUCTION_ALREADY_STARTED",
    category: "AUCTION",
  } as IErrorDefinition,
  AUCTION_STATUS_FORBIDDEN: {
    message: "Action forbidden in current auction status.",
    statusCode: 400,
    errorCode: "AUCTION_STATUS_FORBIDDEN",
    category: "AUCTION",
  } as IErrorDefinition,

  // Dynamic Feature Errors
  CANNOT_EDIT_STATUS: (status: string): IErrorDefinition => ({
    message: `Cannot edit auction in ${status} status`,
    statusCode: 400,
    errorCode: "AUCTION_STATUS_FORBIDDEN",
    category: "AUCTION",
  }),

  USER_NOT_FOUND_BY_ID: (id: string): IErrorDefinition => ({
    message: `User with ID ${id} not found.`,
    statusCode: 404,
    errorCode: "USER_NOT_FOUND",
    category: "RESOURCE",
  }),

  INVALID_PASSWORD: {
    message: "The current password you entered is incorrect.",
    statusCode: 400,
    errorCode: "AUTH_INVALID_PASSWORD",
    category: "AUTH",
  } as IErrorDefinition,

  // Auction specific errors
  AUCTION_ALREADY_STATE: (status: string): IErrorDefinition => ({
    message: `Action failed: Auction is already ${status}.`,
    statusCode: 400,
    errorCode: "AUCTION_STATUS_FORBIDDEN",
    category: "AUCTION",
  }),

  AUCTION_NOT_ENDED: (status: string): IErrorDefinition => ({
    message: `Auction cannot be finalized: Current status is ${status} (expected ENDED).`,
    statusCode: 400,
    errorCode: "AUCTION_STATUS_FORBIDDEN",
    category: "AUCTION",
  }),

  ONLY_SELLER_CAN_FINALIZE: {
    message: "Unauthorized: Only the seller can finalize this auction.",
    statusCode: 403,
    errorCode: "AUCTION_NOT_OWNER",
    category: "AUCTION",
  } as IErrorDefinition,

  NO_BIDDER_CAN_FINALIZE: {
    message: "Cannot finalize an auction that has no bids.",
    statusCode: 400,
    errorCode: "AUCTION_STATE_ERROR",
    category: "AUCTION",
  } as IErrorDefinition,

  AUCTION_NOT_ACTIVE: {
    message: "Auction is not currently active for bidding.",
    statusCode: 400,
    errorCode: "AUCTION_NOT_ACTIVE",
    category: "AUCTION",
  } as IErrorDefinition,

  AUCTION_HAS_ENDED: {
    message: "Bidding failed: This auction has already ended.",
    statusCode: 400,
    errorCode: "AUCTION_HAS_ENDED",
    category: "AUCTION",
  } as IErrorDefinition,

  // Bidding errors
  BID_TOO_LOW: (min: number): IErrorDefinition => ({
    message: `Bid failed: Your bid must be at least ₹${min}.`,
    statusCode: 400,
    errorCode: "BID_TOO_LOW",
    category: "AUCTION",
  }),

  BID_CONFLICT: {
    message: "Bid conflict: Someone else placed a bid just now. Please refresh and try again.",
    statusCode: 409,
    errorCode: "BID_CONFLICT",
    category: "AUCTION",
  } as IErrorDefinition,

  COOLDOWN_ACTIVE: (seconds: number): IErrorDefinition => ({
    message: `Please wait ${seconds}s before placing another bid.`,
    statusCode: 429,
    errorCode: "BID_COOLDOWN",
    category: "AUCTION",
  }),

  AUTO_BID_LIMIT_LOW: {
    message: "Auto-bid limit must be higher than the current highest bid.",
    statusCode: 400,
    errorCode: "BID_LIMIT_ERROR",
    category: "AUCTION",
  } as IErrorDefinition,

  BID_ALREADY_CANCELLED: {
    message: "This bid has already been cancelled.",
    statusCode: 400,
    errorCode: "BID_STATE_ERROR",
    category: "AUCTION",
  } as IErrorDefinition,

  // Budget errors
  GOAL_ALREADY_EXISTS: {
    message: "A bidding goal with this name already exists.",
    statusCode: 400,
    errorCode: "GOAL_EXISTS",
    category: "AUCTION",
  } as IErrorDefinition,

  GOAL_NOT_FOUND: {
    message: "Bidding goal not found.",
    statusCode: 404,
    errorCode: "GOAL_NOT_FOUND",
    category: "AUCTION",
  } as IErrorDefinition,

  BID_EXCEEDS_BUDGET: (goalName: string, remaining: number): IErrorDefinition => ({
    message: `Bid exceeds your budget for goal "${goalName}" (Remaining: ₹${remaining}).`,
    statusCode: 400,
    errorCode: "BUDGET_EXCEEDED",
    category: "AUCTION",
  }),

  // Wallet Errors
  INSUFFICIENT_BALANCE: {
    message: "Insufficient wallet balance to perform this action.",
    statusCode: 400,
    errorCode: "WALLET_INSUFFICIENT_BALANCE",
    category: "WALLET",
  } as IErrorDefinition,
  WALLET_FROZEN: {
    message: "Cannot perform action: Wallet is frozen.",
    statusCode: 403,
    errorCode: "WALLET_FROZEN",
    category: "WALLET",
  } as IErrorDefinition,
  FINANCIAL_RESTRICTION: {
    message: "Financial operations are restricted for this account type.",
    statusCode: 403,
    errorCode: "FINANCIAL_RESTRICTION",
    category: "WALLET",
  } as IErrorDefinition,
  ALREADY_PROCESSED: {
    message: "This request has already been processed.",
    statusCode: 400,
    errorCode: "ALREADY_PROCESSED",
    category: "WALLET",
  } as IErrorDefinition,

  USER_NOT_FOUND: {
    message: "User not found.",
    statusCode: 404,
    errorCode: "USER_NOT_FOUND",
    category: "RESOURCE",
  } as IErrorDefinition,
  DEPOSIT_NOT_FOUND: {
    message: "Deposit request not found.",
    statusCode: 404,
    errorCode: "DEPOSIT_NOT_FOUND",
    category: "WALLET",
  } as IErrorDefinition,
  PAYOUT_NOT_FOUND: {
    message: "Payout request not found.",
    statusCode: 404,
    errorCode: "PAYOUT_NOT_FOUND",
    category: "WALLET",
  } as IErrorDefinition,

  INVALID_AMOUNT: {
    message: "Invalid amount specified. Amount must be positive.",
    statusCode: 400,
    errorCode: "WALLET_INVALID_AMOUNT",
    category: "WALLET",
  } as IErrorDefinition,

  INSUFFICIENT_LOCKED_FUNDS: {
    message: "Insufficient locked funds available for settlement.",
    statusCode: 400,
    errorCode: "WALLET_INSUFFICIENT_LOCKED",
    category: "WALLET",
  } as IErrorDefinition,

  TRANSFER_FAILED: {
    message: "Fund transfer failed during settlement. Please contact support.",
    statusCode: 500,
    errorCode: "WALLET_TRANSFER_FAILED",
    category: "WALLET",
  } as IErrorDefinition,

  // General Error Utils
  RESOURCE_NOT_FOUND: (resource: string): IErrorDefinition => ({
    message: `${resource} not found.`,
    statusCode: 404,
    errorCode: "RESOURCE_NOT_FOUND",
    category: "RESOURCE",
  }),
};
