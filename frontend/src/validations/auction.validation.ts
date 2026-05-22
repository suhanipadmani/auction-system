import { z } from "zod";

export const auctionSchema = z.object({
  title: z.string().trim().min(1, "Title is required").min(3, "Title must be at least 3 characters"),
  description: z.string().trim().min(1, "Description is required").min(10, "Description must be at least 10 characters"),
  basePrice: z.coerce.number().positive("Base price must be greater than 0"),
  minIncrement: z.coerce.number().positive("Minimum increment must be greater than 0"),
  startTime: z.string().trim().min(1, "Start time is required"),
  endTime: z.string().trim().min(1, "End time is required"),
}).refine((data) => {
  const start = new Date(data.startTime).getTime();
  const end = new Date(data.endTime).getTime();
  const now = Date.now();
  return start > now && end > start;
}, {
  message: "Start time must be in the future and before end time",
  path: ["startTime"],
});


