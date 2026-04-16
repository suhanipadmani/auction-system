export interface ICreateAuctionData {
  title: string;
  description: string;
  startingPrice: number;
  startTime: Date;
  endTime: Date;
  images: string[];
  category?: string;
}

export interface IUpdateAuctionData {
  title?: string;
  description?: string;
  startingPrice?: number;
  startTime?: Date;
  endTime?: Date;
  images?: string[];
  category?: string;
}

export interface IAuctionFilters {
  status?: any;
  sellerId?: string;
  category?: string;
  search?: string;
}

export interface IPaginationOptions {
  page: number;
  limit: number;
}
