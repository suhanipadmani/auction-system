import { USER_STATUSES } from "../enums";
import { generateToken } from "../utils/jwt";
import { UserModel } from "../models/user";

export const registerUser = async (data: any) => {
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

export const loginUser = async (data: any) => {
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
