import bcrypt from "bcrypt";
import { UserModel } from "../models/user";

export const createUser = async (data: any) => {
  const existingUser = await UserModel.findOne({ email: data.email });
  if (existingUser) {
    throw new Error("User already exists with this email");
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);
  const newUser = await UserModel.create({
    ...data,
    password: hashedPassword,
  });

  return newUser;
};

export const getAllUsers = async () => {
  return await UserModel.find().select("-password");
};

export const updateUserRole = async (id: string, role: string) => {
  const user = await UserModel.findByIdAndUpdate(
    id,
    { role },
    { new: true }
  ).select("-password");
  
  if (!user) {
    throw new Error("User not found");
  }
  return user;
};

export const deactivateUser = async (id: string) => {
  const user = await UserModel.findByIdAndUpdate(
    id,
    { status: "deleted" },
    { new: true }
  ).select("-password");

  if (!user) {
    throw new Error("User not found");
  }
  return user;
};
