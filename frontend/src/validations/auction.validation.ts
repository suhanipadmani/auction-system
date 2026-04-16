import { IAuctionFormData } from "@/types/auction";
import { z } from "zod";

export const auctionSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  basePrice: z.coerce.number().positive("Base price must be greater than 0"),
  minIncrement: z.coerce.number().positive("Minimum increment must be greater than 0"),
  startTime: z.string(),
  endTime: z.string(),
}).refine((data) => {
  const start = new Date(data.startTime).getTime();
  const end = new Date(data.endTime).getTime();
  const now = Date.now();
  return start > now && end > start;
}, {
  message: "Start time must be in the future and before end time",
  path: ["startTime"],
});


