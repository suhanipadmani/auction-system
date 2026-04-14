import { z } from "zod";

export const createAuctionSchema = z.object({
  body: z.object({
    title: z.string().min(3, "Title must be at least 3 characters").max(100),
    description: z.string().min(10, "Description must be at least 10 characters").max(2000),
    basePrice: z.number().positive("Base price must be greater than 0"),
    minIncrement: z.number().positive("Minimum increment must be greater than 0"),
    startTime: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid start time"),
    endTime: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid end time"),
  }).refine((data) => {
    const start = new Date(data.startTime).getTime();
    const end = new Date(data.endTime).getTime();
    const now = Date.now();
    return start > now && end > start;
  }, {
    message: "Start time must be in the future and before end time",
    path: ["startTime"],
  }),
});

export const updateAuctionSchema = z.object({
  body: z.object({
    title: z.string().min(3).max(100).optional(),
    description: z.string().min(10).max(2000).optional(),
    basePrice: z.number().positive().optional(),
    minIncrement: z.number().positive().optional(),
    startTime: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid start time").optional(),
    endTime: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid end time").optional(),
  }).refine((data) => {
    if (data.startTime && data.endTime) {
      return new Date(data.startTime).getTime() < new Date(data.endTime).getTime();
    }
    return true;
  }, {
    message: "Start time must be before end time",
    path: ["startTime"],
  }),
});

export const adminActionSchema = z.object({
  body: z.object({
    action: z.enum(["approve", "reject"]),
  }),
});
