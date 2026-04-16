import { AuctionStatus, AUCTION_STATUS, AUCTION_STATUS_CONFIG } from "@/constants/auction.constants";

export function useAuctionStatus(status: AuctionStatus) {
  const config = AUCTION_STATUS_CONFIG[status];
  
  const colorClass = config?.colorClass || "bg-gray-500/10 text-gray-500 border-gray-500/20";
  const label = config?.label || status.charAt(0).toUpperCase() + status.slice(1);

  const isLive = status === AUCTION_STATUS.ACTIVE;
  const isUpcoming = status === AUCTION_STATUS.APPROVED;
  const isEnded = status === AUCTION_STATUS.ENDED;
  const isPending = status === AUCTION_STATUS.PENDING;
  
  return {
    colorClass,
    isLive,
    isUpcoming,
    isEnded,
    isPending,
    label
  };
}
