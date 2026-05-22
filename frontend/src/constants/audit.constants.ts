import { 
  Download, 
  Activity, 
  Wallet, 
  Gavel, 
  X, 
  Check 
} from "lucide-react";

export const AUDIT_ACTIONS = {
  BID_PLACED: 'BID_PLACED',
  BID_REMOVED: 'BID_REMOVED',
  AUCTION_CREATED: 'AUCTION_CREATED',
  AUCTION_UPDATED: 'AUCTION_UPDATED',
  AUCTION_CANCELLED: 'AUCTION_CANCELLED',
  WALLET_UPDATED: 'WALLET_UPDATED',
  DEPOSIT_REQUESTED: 'DEPOSIT_REQUESTED',
  DEPOSIT_APPROVED: 'DEPOSIT_APPROVED',
  DEPOSIT_REJECTED: 'DEPOSIT_REJECTED',
} as const;

export const ACTION_MAP: Record<string, { label: string; icon: any; color: string }> = {
  [AUDIT_ACTIONS.BID_PLACED]: { label: "Bid Placed", icon: Gavel, color: "text-blue-400 bg-blue-400/10" },
  [AUDIT_ACTIONS.BID_REMOVED]: { label: "Bid Removed", icon: X, color: "text-red-400 bg-red-400/10" },
  [AUDIT_ACTIONS.AUCTION_CREATED]: { label: "Auction Created", icon: Activity, color: "text-purple-400 bg-purple-400/10" },
  [AUDIT_ACTIONS.AUCTION_UPDATED]: { label: "Auction Updated", icon: Activity, color: "text-amber-400 bg-amber-400/10" },
  [AUDIT_ACTIONS.AUCTION_CANCELLED]: { label: "Auction Cancelled", icon: X, color: "text-red-400 bg-red-400/10" },
  [AUDIT_ACTIONS.WALLET_UPDATED]: { label: "Wallet Change", icon: Wallet, color: "text-emerald-400 bg-emerald-400/10" },
  [AUDIT_ACTIONS.DEPOSIT_REQUESTED]: { label: "Deposit Requested", icon: Download, color: "text-blue-400 bg-blue-400/10" },
  [AUDIT_ACTIONS.DEPOSIT_APPROVED]: { label: "Deposit Approved", icon: Check, color: "text-emerald-400 bg-emerald-400/10" },
  [AUDIT_ACTIONS.DEPOSIT_REJECTED]: { label: "Deposit Rejected", icon: X, color: "text-red-400 bg-red-400/10" },
};
