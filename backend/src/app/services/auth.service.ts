import bcrypt from "bcrypt";
import { UserModel } from "../models/user";
import { generateToken } from "../utils/jwt";

export const registerUser = async (data: any) => {
  const existingUser = await UserModel.findOne({ email: data.email });
  if (existingUser) {
    throw new Error("User already exists with this email");
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);
  const newUser = await UserModel.create({
    ...data,
    password: hashedPassword,
    role: data.role || "bidder",
    status: "active",
  });

  return newUser;
};

export const loginUser = async (data: any) => {
  const user = await UserModel.findOne({ email: data.email });
  if (!user) {
    throw new Error("Invalid credentials");
  }

  if (user.status === "deleted") {
    throw new Error("Account is deactivated");
  }

  const isPasswordValid = await bcrypt.compare(data.password, user.password);
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
