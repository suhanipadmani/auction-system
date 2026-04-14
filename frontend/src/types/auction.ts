export type AuctionStatus = "pending" | "approved" | "rejected" | "active" | "ended" | "cancelled";

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
  highestBidderId?: string | null;
  createdAt: string;
  updatedAt: string;
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
  page?: number;
  limit?: number;
}

export interface IAuctionResponse {
  success: boolean;
  data: IAuction[];
  total: number;
  page: number;
  totalPages: number;
}
