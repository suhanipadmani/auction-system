import { AuctionStatus, AUCTION_STATUS, AUCTION_STATUS_CONFIG } from "@/constants/auction.constants";

export function useAuctionStatus(status: AuctionStatus, endTime?: string) {
  // Check if technically ended by time
  const hasTimePassed = endTime ? new Date(endTime).getTime() <= Date.now() : false;
  
  // Force "Ended" status if time is up, even if backend says "active"
  const derivedStatus = (status === AUCTION_STATUS.ACTIVE && hasTimePassed) 
    ? AUCTION_STATUS.ENDED 
    : status;

  const config = AUCTION_STATUS_CONFIG[derivedStatus];
  
  const colorClass = config?.colorClass || "bg-gray-500/10 text-gray-500 border-gray-500/20";
  const label = config?.label || derivedStatus.charAt(0).toUpperCase() + derivedStatus.slice(1);

  const isLive = derivedStatus === AUCTION_STATUS.ACTIVE;
  const isUpcoming = derivedStatus === AUCTION_STATUS.APPROVED;
  const isEnded = derivedStatus === AUCTION_STATUS.ENDED || derivedStatus === AUCTION_STATUS.EXPIRED;
  const isPending = derivedStatus === AUCTION_STATUS.PENDING;
  
  return {
    colorClass,
    isLive,
    isUpcoming,
    isEnded,
    isPending,
    label
  };
}
