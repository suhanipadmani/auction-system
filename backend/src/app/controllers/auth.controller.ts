import { Request, Response } from "express";
import { registerUser, loginUser } from "../services/auth.service";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/apiResponse";

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
