import { USER_STATUSES } from "../enums";
import { generateToken } from "../utils/jwt";
import { UserModel } from "../models/user";
import { IRegisterData, ILoginData, IAuthResponse } from "../types/auth";

import crypto from "crypto";

export const registerUser = async (data: IRegisterData) => {
  const existingUser = await UserModel.findOne({ email: data.email });
  if (existingUser) {
    throw new Error("User already exists with this email");
  }

  const newUser = await UserModel.create({
    ...data,
    role: data.role || "bidder",
    status: USER_STATUSES.ACTIVE,
  });

  return newUser;
};

export const loginUser = async (data: ILoginData): Promise<IAuthResponse> => {
  const user = await UserModel.findOne({ email: data.email });
  if (!user) {
    throw new Error("Invalid credentials");
  }

  if (user.status === USER_STATUSES.INACTIVE) {
    throw new Error("Your account has been deactivated. Please contact support.");
  }

  if (user.status === USER_STATUSES.DELETED) {
    throw new Error("This account no longer exists.");
  }

  const isPasswordValid = await (user as any).comparePassword(data.password);
  if (!isPasswordValid) {
    throw new Error("Invalid credentials");
  }

  const token = generateToken({
    id: user._id.toString(),
    role: user.role,
    status: user.status,
  });

  return { user, token };
};

export const forgotPassword = async (email: string) => {
  const user = await UserModel.findOne({ email });
  if (!user) {
    throw new Error("User with this email does not exist");
  }

  // Generate Reset Token
  const resetToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

  // Save to User
  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpires = new Date(Date.now() + 30 * 60 * 1000) as any; // 30 mins
  await user.save();

  // MOCK: Log to console instead of sending real email
  console.log(`[AUTH-SERVICE] Password Reset: http://localhost:3000/reset-password?token=${resetToken}`);

  return { message: "Reset token generated and logged to console" };
};

export const resetPassword = async (token: string, password: string) => {
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await UserModel.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw new Error("Token is invalid or has expired");
  }

  // Set new password
  user.password = password;
  user.resetPasswordToken = null;
  user.resetPasswordExpires = null;
  await user.save();

  return { message: "Password has been reset successfully" };
};

