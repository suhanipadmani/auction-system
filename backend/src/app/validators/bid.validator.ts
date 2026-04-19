import { z } from "zod";

export const placeBidSchema = z.object({
  body: z.object({
    auctionId: z.string().min(24, "Invalid auction ID"),
    amount: z.number().positive("Bid amount must be greater than 0"),
  }),
});

export const setupAutoBidSchema = z.object({
  body: z.object({
    auctionId: z.string().min(24, "Invalid auction ID"),
    limit: z.number().positive("Auto-bid limit must be greater than 0"),
  }),
});
