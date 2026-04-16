export const AUCTION_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  ACTIVE: "active",
  ENDED: "ended",
  SOLD: "sold",
  REJECTED: "rejected",
  CANCELLED: "cancelled",
  EXPIRED: "expired",
} as const;

export type AuctionStatus = typeof AUCTION_STATUS[keyof typeof AUCTION_STATUS];

export const AUCTION_STATUS_CONFIG = {
  [AUCTION_STATUS.PENDING]: {
    label: "Pending",
    colorClass: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  },
  [AUCTION_STATUS.APPROVED]: {
    label: "Approved",
    colorClass: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  },
  [AUCTION_STATUS.REJECTED]: {
    label: "Rejected",
    colorClass: "bg-red-500/10 text-red-500 border-red-500/20",
  },
  [AUCTION_STATUS.ACTIVE]: {
    label: "Active",
    colorClass: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  },
  [AUCTION_STATUS.ENDED]: {
    label: "Ended",
    colorClass: "bg-gray-500/10 text-gray-400 border-gray-500/20",
  },
  [AUCTION_STATUS.CANCELLED]: {
    label: "Cancelled",
    colorClass: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  },
  [AUCTION_STATUS.SOLD]: {
    label: "Sold",
    colorClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  },
  [AUCTION_STATUS.EXPIRED]: {
    label: "Expired",
    colorClass: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
  },
} as const;

export const AUCTION_STATUS_OPTIONS = [
  { value: "all", label: "All Status" },
  ...Object.entries(AUCTION_STATUS_CONFIG).map(([value, config]) => ({
    value,
    label: config.label,
  })),
];
