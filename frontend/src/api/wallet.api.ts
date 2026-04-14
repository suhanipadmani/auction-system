import { axiosClient } from "../lib/axios";

export const walletApi = {
  
  // Bidder operations
  getBalance: async () => {
    const response = await axiosClient.get("/wallet/balance");
    return response.data;
  },
  
  getTransactions: async () => {
    const response = await axiosClient.get("/wallet/transactions");
    return response.data;
  },
  
  getMyRequests: async () => {
    const response = await axiosClient.get("/wallet/requests");
    return response.data;
  },
  
  requestDeposit: async (amount: number) => {
    const response = await axiosClient.post("/wallet/deposit", { amount });
    return response.data;
  },

  // Admin operations
  getPendingDeposits: async (status?: string) => {
    const response = await axiosClient.get("/admin/wallet/pending-deposits", { params: { status } });
    return response.data;
  },

  getAllTransactions: async (params?: any) => {
    const response = await axiosClient.get("/admin/wallet/transactions", { params });
    return response.data;
  },

  getUserWallet: async (userId: string) => {
    const response = await axiosClient.get(`/admin/wallet/user/${userId}`);
    return response.data;
  },
  
  processDeposit: async (data: { requestId: string; status: "approved" | "rejected"; adminNote?: string }) => {
    const response = await axiosClient.post("/admin/wallet/process-deposit", data);
    return response.data;
  },
  
  adjustBalance: async (data: { userId: string; amount: number; type: "credit" | "debit"; note: string }) => {
    const response = await axiosClient.post("/admin/wallet/adjust-balance", data);
    return response.data;
  },
  
  toggleFreeze: async (data: { userId: string; isFrozen: boolean }) => {
    const response = await axiosClient.post("/admin/wallet/toggle-freeze", data);
    return response.data;
  }
};
