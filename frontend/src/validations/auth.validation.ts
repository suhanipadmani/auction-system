import { z } from "zod";
import { USER_ROLES } from "@/enums/user.enum";

export const loginSchema = z.object({
  email: z.string().trim().min(1, "Email is required").email("Please enter a valid email"),
  password: z.string().trim().min(1, "Password is required"),
  role: z.nativeEnum(USER_ROLES),
});

export const registerSchema = z.object({
  name: z.string().trim()
    .min(1, "Name is required")
    .min(2, "Name must be at least 2 characters")
    .regex(/^[A-Za-z\s]+$/, "Name can only contain alphabetic characters and spaces"),
  email: z.string().trim().min(1, "Email is required").email("Please enter a valid email"),
  password: z.string().trim().min(1, "Password is required").min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().trim().min(1, "Confirm password is required"),
  role: z.nativeEnum(USER_ROLES),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});
export const forgotPasswordSchema = z.object({
  email: z.string().trim().min(1, "Email is required").email("Invalid email address"),
});

export const resetPasswordSchema = z.object({
  password: z.string().trim().min(1, "Password is required").min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});
