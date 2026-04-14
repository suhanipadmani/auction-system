import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { walletApi } from "../api/wallet.api";
import { toast } from "react-hot-toast";

// --- Bidder Hooks ---

export const useBalance = () => useQuery({
  queryKey: ["wallet-balance"],
  queryFn: walletApi.getBalance
});

export const useTransactions = () => useQuery({
  queryKey: ["wallet-transactions"],
  queryFn: walletApi.getTransactions
});

export const useMyRequests = () => useQuery({
  queryKey: ["wallet-requests"],
  queryFn: walletApi.getMyRequests
});

export const useRequestDeposit = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: walletApi.requestDeposit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wallet-requests"] });
      toast.success("Deposit request submitted successfully!");
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
  const requestDeposit = useRequestDeposit();

  return {
    balance,
    transactions,
    requests,
    requestDeposit,
    isLoading: balance.isLoading || transactions.isLoading || requests.isLoading,
    isError: balance.isError || transactions.isError || requests.isError,
  };
};


// --- Admin Hooks ---

export const usePendingDeposits = (status?: string) => useQuery({
  queryKey: ["admin-pending-deposits", status],
  queryFn: () => walletApi.getPendingDeposits(status)
});

export const useAllTransactions = (params?: any) => useQuery({
  queryKey: ["admin-all-transactions", params],
  queryFn: () => walletApi.getAllTransactions(params)
});

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
