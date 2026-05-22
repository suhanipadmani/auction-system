import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { budgetApi } from "../api/budget.api";
import { IBudgetGoal } from "@/types/budget";

import { toast } from "react-hot-toast";

export const BUDGET_KEYS = {
  all: ["budgets"] as const,
  lists: () => [...BUDGET_KEYS.all, "list"] as const,
  details: () => [...BUDGET_KEYS.all, "detail"] as const,
};

export const useBudgets = () => {
  return useQuery({
    queryKey: BUDGET_KEYS.lists(),
    queryFn: budgetApi.getGoals,
  });
};

export const useCreateBudget = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: budgetApi.createGoal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BUDGET_KEYS.lists() });
      toast.success("Goal created successfully");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to create goal");
    }
  });
};

export const useAssignAuctionToBudget = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ goalId, auctionId }: { goalId: string; auctionId: string }) => 
      budgetApi.assignAuction(goalId, auctionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BUDGET_KEYS.lists() });
      toast.success("Auction assigned to goal");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to assign auction");
    }
  });
};

export const useUnassignAuctionFromBudget = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ auctionId }: { auctionId: string }) => 
      budgetApi.unassignAuction(auctionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BUDGET_KEYS.lists() });
      toast.success("Auction unassigned from goal");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to unassign auction");
    }
  });
};

export const useDeleteBudget = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: budgetApi.deleteGoal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BUDGET_KEYS.lists() });
      toast.success("Goal deleted");
    },
  });
};

export const useUpdateBudget = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<IBudgetGoal> }) => 
      budgetApi.updateGoal(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BUDGET_KEYS.lists() });
    },
  });
};
