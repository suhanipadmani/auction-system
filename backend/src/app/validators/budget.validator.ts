import { z } from "zod";

export const createBudgetSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters").max(50, "Name cannot exceed 50 characters"),
    maxBudget: z.number().positive("Maximum budget must be greater than 0").max(1000000000, "Budget exceeds maximum allowed limit"),
  }),
});

export const updateBudgetSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(50).optional(),
    maxBudget: z.number().positive().max(1000000000, "Budget exceeds maximum allowed limit").optional(),
  }),
});

export const assignAuctionSchema = z.object({
  body: z.object({
    auctionId: z.string().min(24, "Invalid auction ID"),
  }),
});
