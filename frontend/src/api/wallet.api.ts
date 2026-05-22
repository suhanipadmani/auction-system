import { TRANSACTION_STATUSES } from "@/enums/wallet.enum";
import { axiosClient } from "../lib/axios";
import { 
  IBalanceAdjustmentDTO, 
  IProcessDepositDTO, 
  IProcessPayoutDTO, 
  IToggleFreezeDTO 
} from "@/types/wallet";

export const walletApi = {
  
  // Bidder operations
  getBalance: async () => {
    const response = await axiosClient.get("/wallet/balance");
    return response.data;
  },
  
  getTransactions: async (page = 1, limit = 20) => {
    const response = await axiosClient.get("/wallet/transactions", { params: { page, limit } });
    return { data: response.data.data, ...response.data.meta };
  },
  
  getMyRequests: async (page = 1, limit = 20) => {
    const response = await axiosClient.get("/wallet/requests", { params: { page, limit } });
    return { data: response.data.data, ...response.data.meta };
  },
  
  requestDeposit: async (amount: number) => {
    const response = await axiosClient.post("/wallet/deposit", { amount });
    return response.data;
  },

  requestPayout: async (amount: number) => {
    const response = await axiosClient.post("/wallet/payout", { amount });
    return response.data;
  },

  getMyPayoutRequests: async (page = 1, limit = 20) => {
    const response = await axiosClient.get("/wallet/payout-requests", { params: { page, limit } });
    return { data: response.data.data, ...response.data.meta };
  },

  // Admin operations
  getPendingDeposits: async (status?: string | TRANSACTION_STATUSES, page = 1, limit = 20) => {
    const response = await axiosClient.get("/admin/wallet/pending-deposits", { 
      params: { status, page, limit } 
    });
    return { data: response.data.data, ...response.data.meta };
  },

  getPendingPayouts: async (status?: string | TRANSACTION_STATUSES, page = 1, limit = 20) => {
    const response = await axiosClient.get("/admin/wallet/pending-payouts", { 
      params: { status, page, limit } 
    });
    return { data: response.data.data, ...response.data.meta };
  },

  getAllTransactions: async (params?: any) => {
    const response = await axiosClient.get("/admin/wallet/transactions", { params });
    return { data: response.data.data, ...response.data.meta };
  },

  getUserWallet: async (userId: string) => {
    const response = await axiosClient.get(`/admin/wallet/user/${userId}`);
    return response.data;
  },
  
  processDeposit: async (data: IProcessDepositDTO) => {
    const response = await axiosClient.post("/admin/wallet/process-deposit", data);
    return response.data;
  },

  processPayout: async (data: IProcessPayoutDTO) => {
    const response = await axiosClient.post("/admin/wallet/process-payout", data);
    return response.data;
  },
  
  adjustBalance: async (data: IBalanceAdjustmentDTO) => {
    const response = await axiosClient.post("/admin/wallet/adjust-balance", data);
    return response.data;
  },
  
  toggleFreeze: async (data: IToggleFreezeDTO) => {
    const response = await axiosClient.post("/admin/wallet/toggle-freeze", data);
    return response.data;
  }
};
