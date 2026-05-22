import { AuctionStatus } from "@/constants/auction.constants";

export type { AuctionStatus };
export type IAuctionTabType = "active" | "won" | "past";
export type IDiscoveryTabType = "live" | "upcoming";
export type AdminTab = "pending" | "history";

export interface IAuction {
  _id: string;
  title: string;
  description: string;
  sellerId: {
    _id: string;
    name: string;
  };
  basePrice: number;
  minIncrement: number;
  startTime: string;
  endTime: string;
  status: AuctionStatus;
  highestBid: number;
  highestBidderId?: string | { _id: string; name: string } | null;
  currentUserStatus?: "winning" | "outbid";

  createdAt: string;
  updatedAt: string;
  bidCount?: number;
}

export interface ICreateAuctionDTO {
  title: string;
  description: string;
  basePrice: number;
  minIncrement: number;
  startTime: string;
  endTime: string;
}

export interface IUpdateAuctionDTO extends Partial<ICreateAuctionDTO> {}

export interface IAuctionFilters {
  status?: AuctionStatus;
  sellerId?: string;
  search?: string;
  activity?: "my";
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface IAuctionResponse {
  success: boolean;
  data: IAuction[];
  total: number;
  page: number;
  totalPages: number;
}
export type IAuctionFormData = {
  title: string;
  description: string;
  basePrice: number;
  minIncrement: number;
  startTime: string;
  endTime: string;
};

export interface IMyActivityParams {
  page?: number; 
  limit?: number; 
  tab?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
}

export interface IMyActivityResponse {
  success: boolean; 
  data: IAuction[]; 
  total?: number;
  page?: number;
  totalPages?: number;
  stats: { 
    activeWinningCount: number; 
    activeOutbidCount: number; 
    wonCount: number;
    lossCount: number;
    totalSpent: number;
  } 
}

export interface ISellerStats {
  activeListings: number; 
  completedSales: number; 
  totalEarnings: number;
  successRate: number;
  avgHighestBid: number;
  maxBidReceived: number;
}

export interface IAdminStats {
  totalAuctions: number; 
  systemRevenue: number; 
  activeUsersCount: number;
  totalUsersCount: number;
}

export interface IPublicStats {
  totalAuctions: number; 
  activeAuctions: number; 
  activeBidders: number;
  totalBids: number;
  totalVolume: number;
}

export interface IBidsResponse {
  success: boolean; 
  data: any[]; 
  total?: number;
  page?: number;
  totalPages?: number;
}

export interface IAdminAuctionConfirmModal {
  isOpen: boolean;
  auctionId: string | null;
  action: "approve" | "reject" | null;
}

