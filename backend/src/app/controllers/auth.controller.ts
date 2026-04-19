import { Request, Response } from "express";

// Utils
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/apiResponse";

// Services
import { registerUser, loginUser, forgotPassword, resetPassword } from "../services/auth.service";

export const register = asyncHandler(async (req: Request, res: Response) => {
  const user = await registerUser(req.body);
  sendSuccess(res, "User registered successfully", user, 201);
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const data = await loginUser(req.body);
  sendSuccess(res, "Login successful", data);
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, "Logged out successfully");
});

export const requestPasswordReset = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;
  const result = await forgotPassword(email);
  sendSuccess(res, "If that email is registered, a reset link will be sent.", result);
});

export const handleResetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { token, password } = req.body;
  const result = await resetPassword(token, password);
  sendSuccess(res, "Password reset successfully", result);
});
