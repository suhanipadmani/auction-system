import { z } from "zod";

export const depositRequestSchema = z.object({
  body: z.object({
    amount: z.number().positive("Deposit amount must be greater than 0").max(1000000, "Maximum deposit limit exceeded"),
  }),
});

export const adjustBalanceSchema = z.object({
  body: z.object({
    userId: z.string().min(24, "Invalid user ID"),
    amount: z.number(),
    note: z.string().min(3, "Note must be at least 3 characters").max(200),
  }),
});
