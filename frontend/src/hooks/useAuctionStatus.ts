import { AuctionStatus } from "@/constants/auction.constants";
import { getAuctionStatusInfo } from "@/lib/utils/auctions/status";


export function useAuctionStatus(status: AuctionStatus, endTime?: string) {
  return getAuctionStatusInfo(status, endTime);
}

