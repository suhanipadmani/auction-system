import { axiosClient } from "@/lib/axios";
import { 
  IAuctionFilters, 
  IAuctionResponse, 
  ICreateAuctionDTO, 
  IAuction, 
  IUpdateAuctionDTO,
  IMyActivityParams,
  IMyActivityResponse,
  ISellerStats,
  IAdminStats,
  IPublicStats,
  IBidsResponse
} from "@/types/auction";

export const auctionApi = {
  getAuctions: async (filters: IAuctionFilters = {}): Promise<IAuctionResponse> => {
    const params = new URLSearchParams();
    if (filters.status) params.append("status", filters.status);
    if (filters.sellerId) params.append("sellerId", filters.sellerId);
    if (filters.page) params.append("page", filters.page.toString());
    if (filters.limit) params.append("limit", filters.limit.toString());
    if (filters.search) params.append("search", filters.search);
    if (filters.sortBy) params.append("sortBy", filters.sortBy);
    if (filters.sortOrder) params.append("sortOrder", filters.sortOrder);
    
    const response = await axiosClient.get(`/auctions?${params.toString()}`);
    return { data: response.data.data, ...response.data.meta };
  },

  getAuctionById: async (id: string): Promise<{ success: boolean; data: IAuction }> => {
    const response = await axiosClient.get(`/auctions/${id}`);
    return response.data;
  },

  createAuction: async (data: ICreateAuctionDTO): Promise<{ success: boolean; data: IAuction }> => {
    const response = await axiosClient.post("/auctions", data);
    return response.data;
  },

  updateAuction: async (id: string, data: IUpdateAuctionDTO): Promise<{ success: boolean; data: IAuction }> => {
    const response = await axiosClient.patch(`/auctions/${id}`, data);
    return response.data;
  },

  cancelAuction: async (id: string): Promise<{ success: boolean; data: IAuction }> => {
    const response = await axiosClient.delete(`/auctions/${id}`);
    return response.data;
  },

  adminApproveAction: async (id: string, action: "approve" | "reject"): Promise<{ success: boolean; data: IAuction }> => {
    const response = await axiosClient.patch(`/auctions/${id}/approve`, { action });
    return response.data;
  },

  adminForceAction: async (id: string, action: "start" | "end"): Promise<{ success: boolean; data: IAuction }> => {
    const response = await axiosClient.patch(`/auctions/${id}/force-action`, { action });
    return response.data;
  },

  finalizeAuction: async (id: string): Promise<{ success: boolean; data: IAuction }> => {
    const response = await axiosClient.patch(`/auctions/${id}/finalize`);
    return response.data;
  },

  getMyBiddingActivity: async (params?: IMyActivityParams): Promise<IMyActivityResponse> => {
    const response = await axiosClient.get("/auctions/my-activity", { params });
    return { ...response.data.data, ...response.data.meta };
  },
  
  getSellerStats: async (): Promise<{ success: boolean; data: ISellerStats }> => {
    const response = await axiosClient.get("/auctions/seller-stats");
    return response.data;
  },

  getAdminStats: async (): Promise<{ success: boolean; data: IAdminStats }> => {
    const response = await axiosClient.get("/auctions/admin-stats");
    return response.data;
  },

  getAdminInventory: async (filters: IAuctionFilters = {}): Promise<IAuctionResponse> => {
    const params = new URLSearchParams();
    if (filters.status) params.append("status", filters.status);
    if (filters.search) params.append("search", filters.search);
    if (filters.sellerId) params.append("sellerId", filters.sellerId);
    if (filters.page) params.append("page", filters.page.toString());
    if (filters.limit) params.append("limit", filters.limit.toString());

    const response = await axiosClient.get(`/auctions/admin/inventory?${params.toString()}`);
    return { data: response.data.data, ...response.data.meta };
  },

  getAuctionBids: async (id: string, params: { page?: number; limit?: number } = {}): Promise<IBidsResponse> => {
    const response = await axiosClient.get(`/auctions/${id}/bids`, { params });
    return { data: response.data.data, ...response.data.meta };
  },

  getBidStatus: async (id: string): Promise<{ success: boolean; data: any }> => {
    const response = await axiosClient.get(`/bids/status/${id}`);
    return response.data;
  },

  getPublicStats: async (): Promise<{ success: boolean; data: IPublicStats }> => {
    const response = await axiosClient.get("/auctions/public-stats");
    return response.data;
  }
};

