import { z } from "zod";

export const budgetGoalSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Goal name must be at least 2 characters")
    .max(50, "Goal name cannot exceed 50 characters"),
  maxBudget: z.coerce
    .number({ message: "Budget must be a number" })
    .min(1, "Budget is required")
    .positive("Please enter a valid budget greater than 0")
    .max(1000000000, "Budget exceeds maximum allowed limit"),
});

export type BudgetGoalForm = z.input<typeof budgetGoalSchema>;

export type BudgetGoalInput = z.output<typeof budgetGoalSchema>;
