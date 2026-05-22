import { axiosClient } from "@/lib/axios";
import { IBudgetGoal, ICreateBudgetGoalDTO } from "@/types/budget";


export const budgetApi = {
  getGoals: async (): Promise<{ success: boolean; data: IBudgetGoal[] }> => {
    const response = await axiosClient.get("/budgets");
    return response.data;
  },

  createGoal: async (data: ICreateBudgetGoalDTO): Promise<{ success: boolean; data: IBudgetGoal }> => {
    const response = await axiosClient.post("/budgets", data);
    return response.data;
  },

  updateGoal: async (id: string, data: Partial<IBudgetGoal>): Promise<{ success: boolean; data: IBudgetGoal }> => {
    const response = await axiosClient.patch(`/budgets/${id}`, data);
    return response.data;
  },

  deleteGoal: async (id: string): Promise<{ success: boolean }> => {
    const response = await axiosClient.delete(`/budgets/${id}`);
    return response.data;
  },

  assignAuction: async (goalId: string, auctionId: string): Promise<{ success: boolean; data: IBudgetGoal }> => {
    const response = await axiosClient.post(`/budgets/${goalId}/assign`, { auctionId });
    return response.data;
  },
  unassignAuction: async (auctionId: string): Promise<{ success: boolean }> => {
    const response = await axiosClient.post(`/budgets/unassign`, { auctionId });
    return response.data;
  }
};
