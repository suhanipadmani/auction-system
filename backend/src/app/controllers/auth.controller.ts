import { Request, Response, NextFunction } from "express";
import { registerUser, loginUser } from "../services/auth.service";

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await registerUser(req.body);
    res.status(201).json({ success: true, message: "User registered successfully", data: user });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await loginUser(req.body);
    res.status(200).json({ success: true, message: "Login successful", data });
  } catch (error: any) {
    res.status(401).json({ success: false, message: error.message });
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  res.status(200).json({ success: true, message: "Logged out successfully" });
};
