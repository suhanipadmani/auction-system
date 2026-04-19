import { AuctionStatus } from "@/constants/auction.constants";

export type { AuctionStatus };
export type IAuctionTabType = "active" | "won" | "past";
export type IDiscoveryTabType = "live" | "upcoming";



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

