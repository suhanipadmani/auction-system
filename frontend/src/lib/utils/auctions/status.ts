import { AuctionStatus, AUCTION_STATUS, AUCTION_STATUS_CONFIG } from "@/constants/auction.constants";

export function getAuctionStatusInfo(status: AuctionStatus, endTime?: string) {
  const hasTimePassed = endTime ? new Date(endTime).getTime() <= Date.now() : false;
  
  const derivedStatus = (status === AUCTION_STATUS.ACTIVE && hasTimePassed) 
    ? AUCTION_STATUS.ENDED 
    : status;

  const config = AUCTION_STATUS_CONFIG[derivedStatus];
  
  return {
    derivedStatus,
    colorClass: config?.colorClass || "bg-gray-500/10 text-gray-500 border-gray-500/20",
    label: config?.label || derivedStatus.charAt(0).toUpperCase() + derivedStatus.slice(1),
    isLive: derivedStatus === AUCTION_STATUS.ACTIVE,
    isUpcoming: derivedStatus === AUCTION_STATUS.APPROVED,
    isEnded: [AUCTION_STATUS.ENDED, AUCTION_STATUS.EXPIRED].includes(derivedStatus),
    isPending: derivedStatus === AUCTION_STATUS.PENDING
  };
}
