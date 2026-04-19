import { Request, Response } from "express";
import { BudgetService } from "../services/budget.service";
import { sendSuccess } from "../utils/apiResponse";

export const create = async (req: Request, res: Response) => {
  const { name, maxBudget } = req.body;
  const goal = await BudgetService.createGoal(req.user!.id, name, maxBudget);
  sendSuccess(res, "Goal created successfully", goal, 201);
};

export const getAll = async (req: Request, res: Response) => {
  const goals = await BudgetService.getGoals(req.user!.id);
  sendSuccess(res, "Goals retrieved successfully", goals);
};

export const update = async (req: Request, res: Response) => {
  const { id } = req.params;
  const goal = await BudgetService.updateGoal(id as string, req.user!.id, req.body);
  sendSuccess(res, "Goal updated successfully", goal);
};

export const deleteBudget = async (req: Request, res: Response) => {
  const { id } = req.params;
  await BudgetService.deleteGoal(id as string, req.user!.id);
  sendSuccess(res, "Goal deleted successfully");
};

export const assignAuction = async (req: Request, res: Response) => {
  const { id } = req.params; // budget/goal id
  const { auctionId } = req.body;
  const goal = await BudgetService.assignAuctionToGoal(req.user!.id, id as string, auctionId);
  sendSuccess(res, "Auction assigned to goal successfully", goal);
};
