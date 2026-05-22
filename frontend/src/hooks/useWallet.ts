import { useMutation, useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

import { walletApi } from "../api/wallet.api";

// Bidder Hooks

export const useBalance = () => useQuery({
  queryKey: ["wallet-balance"],
  queryFn: walletApi.getBalance
});

export const useTransactions = (page = 1, limit = 20) => useQuery({
  queryKey: ["wallet-transactions", page, limit],
  queryFn: () => walletApi.getTransactions(page, limit)
});

export const useMyRequests = (page = 1, limit = 20) => useQuery({
  queryKey: ["wallet-requests", page, limit],
  queryFn: () => walletApi.getMyRequests(page, limit)
});

export const useMyPayoutRequests = (page = 1, limit = 20) => useQuery({
  queryKey: ["wallet-payout-requests", page, limit],
  queryFn: () => walletApi.getMyPayoutRequests(page, limit)
});

export const useRequestDeposit = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: walletApi.requestDeposit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wallet-requests"] });
      queryClient.invalidateQueries({ queryKey: ["wallet-transactions"] });
      toast.success("Deposit request submitted successfully!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to submit request");
    }
  });
};

export const useRequestPayout = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: walletApi.requestPayout,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wallet-payout-requests"] });
      queryClient.invalidateQueries({ queryKey: ["wallet-balance"] });
      queryClient.invalidateQueries({ queryKey: ["wallet-transactions"] });
      toast.success("Withdrawal request submitted successfully! Amount moved to locked balance.");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to submit request");
    }
  });
};

export const useWallet = () => {
  const balance = useBalance();
  const transactions = useTransactions();
  const requests = useMyRequests();
  const payoutRequests = useMyPayoutRequests();
  const requestDeposit = useRequestDeposit();
  const requestPayout = useRequestPayout();

  return {
    balance,
    transactions,
    requests,
    payoutRequests,
    requestDeposit,
    requestPayout,
    isLoading: balance.isLoading || transactions.isLoading || requests.isLoading || payoutRequests.isLoading,
    isError: balance.isError || transactions.isError || requests.isError || payoutRequests.isError,
  };
};


// Admin Hooks

export const usePendingDeposits = (status?: string, page = 1, limit = 20) => useQuery({
  queryKey: ["admin-pending-deposits", status, page, limit],
  queryFn: () => walletApi.getPendingDeposits(status, page, limit)
});

export const usePendingPayouts = (status?: string, page = 1, limit = 20) => useQuery({
  queryKey: ["admin-pending-payouts", status, page, limit],
  queryFn: () => walletApi.getPendingPayouts(status, page, limit)
});

export const useAllTransactions = (params: any = {}) => {
  const { page = 1, limit = 20, ...rest } = params;
  return useQuery({
    queryKey: ["admin-all-transactions", { page, limit, ...rest }],
    queryFn: () => walletApi.getAllTransactions({ page, limit, ...rest }),
    placeholderData: keepPreviousData,
  });
};

export const useUserWallet = (userId: string) => useQuery({
  queryKey: ["admin-user-wallet", userId],
  queryFn: () => walletApi.getUserWallet(userId),
  enabled: !!userId
});

export const useProcessDeposit = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: walletApi.processDeposit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-pending-deposits"] });
      queryClient.invalidateQueries({ queryKey: ["admin-all-transactions"] });
      queryClient.invalidateQueries({ queryKey: ["wallet-balance"] });
      toast.success("Deposit request processed!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to process deposit");
    }
  });
};

export const useProcessPayout = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: walletApi.processPayout,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-pending-payouts"] });
      queryClient.invalidateQueries({ queryKey: ["admin-all-transactions"] });
      queryClient.invalidateQueries({ queryKey: ["wallet-balance"] });
      toast.success("Payout request processed!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to process payout");
    }
  });
};

export const useAdjustBalance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: walletApi.adjustBalance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wallet-balance"] });
      queryClient.invalidateQueries({ queryKey: ["admin-all-transactions"] });
      toast.success("User balance adjusted successfully!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to adjust balance");
    }
  });
};

export const useToggleFreeze = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: walletApi.toggleFreeze,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-user-wallet", variables.userId] });
      queryClient.invalidateQueries({ queryKey: ["wallet-balance"] });
      toast.success("Wallet status updated!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update wallet status");
    }
  });
};
