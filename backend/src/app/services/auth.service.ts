import { USER_STATUSES } from "../enums";
import { generateToken } from "../utils/jwt";
import { UserModel } from "../models/user";
import { IRegisterData, ILoginData, IAuthResponse } from "../types/auth";
import crypto from "crypto";
import { AppError, ErrorMessages } from "../errors";
import { EmailService } from "./email.service";
import { env } from "../../config";

export const registerUser = async (data: IRegisterData) => {
  const existingUser = await UserModel.findOne({ email: data.email });
  if (existingUser) {
    throw AppError.from(ErrorMessages.USER_ALREADY_EXISTS);
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
    throw AppError.from(ErrorMessages.INVALID_CREDENTIALS);
  }

  if (user.status === USER_STATUSES.INACTIVE) {
    throw AppError.from(ErrorMessages.ACCOUNT_DEACTIVATED);
  }

  if (user.status === USER_STATUSES.DELETED) {
    throw AppError.from(ErrorMessages.ACCOUNT_DELETED);
  }

  const isPasswordValid = await (user as any).comparePassword(data.password);
  if (!isPasswordValid) {
    throw AppError.from(ErrorMessages.INVALID_CREDENTIALS);
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
    throw AppError.from(ErrorMessages.USER_NOT_FOUND);
  }

  // Generate Reset Token
  const resetToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

  // Save to User
  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpires = new Date(Date.now() + 30 * 60 * 1000) as any; // 30 mins
  await user.save();

  // Send Real Email
  const resetLink = `${env.frontendUrl}/reset-password?token=${resetToken}`;
  await EmailService.sendPasswordResetEmail(user.email, resetLink);

  return { message: "Reset link has been sent to your email" };
};

export const resetPassword = async (token: string, password: string) => {
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await UserModel.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw AppError.from(ErrorMessages.INVALID_RESET_TOKEN);
  }

  // Set new password
  user.password = password;
  user.resetPasswordToken = null;
  user.resetPasswordExpires = null;
  await user.save();

  return { message: "Password has been reset successfully" };
};

