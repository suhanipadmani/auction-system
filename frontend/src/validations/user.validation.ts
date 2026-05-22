import { z } from "zod";

export const profileSchema = z.object({
  name: z.string().trim()
    .min(1, "Name is required")
    .min(2, "Name must be at least 2 characters")
    .regex(/^[A-Za-z\s]+$/, "Name can only contain alphabetic characters and spaces"),
});

export const passwordSchema = z.object({
  currentPassword: z.string().trim().min(1, "Current password is required"),
  newPassword: z.string().trim().min(1, "New password is required").min(6, "New password must be at least 6 characters"),
  confirmPassword: z.string().trim().min(1, "Confirm password is required"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});
