import { z } from "zod";

export const createBudgetSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters").max(50),
    amount: z.number().positive("Amount must be greater than 0"),
    durationInDays: z.number().positive().max(365, "Duration cannot exceed 1 year"),
  }),
});

export const updateBudgetSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(50).optional(),
    amount: z.number().positive().optional(),
    isActive: z.boolean().optional(),
  }),
});

export const assignAuctionSchema = z.object({
  body: z.object({
    auctionId: z.string().min(24, "Invalid auction ID"),
  }),
});
