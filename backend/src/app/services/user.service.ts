import bcrypt from "bcrypt";
import { USER_STATUSES } from "../enums";
import { UserModel } from "../models/user";
import { ICreateUserData } from "../types/user";

export const createUser = async (data: ICreateUserData) => {
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


/**
 * Returns all users.
 * By default excludes DELETED users (hidden from system).
 * INACTIVE users are always visible — they are blocked but not hidden.
 */
export const getAllUsers = async (includeDeleted = false, options: { page?: number; limit?: number; search?: string; role?: string } = {}) => {
  const { page = 1, limit = 20, search, role } = options;
  const skip = (page - 1) * limit;

  const filter: any = includeDeleted ? {} : { status: { $ne: USER_STATUSES.DELETED } };
  
  if (role) {
    filter.role = role;
  }

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } }
    ];
  }
  
  const [data, total] = await Promise.all([
    UserModel.find(filter)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    UserModel.countDocuments(filter),
  ]);

  return {
    data,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
};

export const updateUserRole = async (id: string, role: string) => {
  const user = await UserModel.findByIdAndUpdate(
    id,
    { role },
    { returnDocument: "after" }
  ).select("-password");

  if (!user) throw new Error("User not found");
  return user;
};

/** Deactivate — blocks login but keeps user visible in the system. */
export const deactivateUser = async (id: string) => {
  const user = await UserModel.findByIdAndUpdate(
    id,
    { status: USER_STATUSES.INACTIVE },
    { returnDocument: "after" }
  ).select("-password");

  if (!user) throw new Error("User not found");
  return user;
};

/** Activate — restores login access for a deactivated user. */
export const activateUser = async (id: string) => {
  const user = await UserModel.findByIdAndUpdate(
    id,
    { status: USER_STATUSES.ACTIVE },
    { returnDocument: "after" }
  ).select("-password");

  if (!user) throw new Error("User not found");
  return user;
};

/** Soft-delete — hides user from the system; data is preserved. */
export const softDeleteUser = async (id: string) => {
  const user = await UserModel.findByIdAndUpdate(
    id,
    { status: USER_STATUSES.DELETED },
    { returnDocument: "after" }
  ).select("-password");

  if (!user) throw new Error("User not found");
  return user;
};

/** Restore — makes a soft-deleted user active again. */
export const restoreUser = async (id: string) => {
  const user = await UserModel.findByIdAndUpdate(
    id,
    { status: USER_STATUSES.ACTIVE },
    { returnDocument: "after" }
  ).select("-password");

  if (!user) throw new Error("User not found");
  return user;
};

export const updateProfile = async (id: string, name: string) => {
  const user = await UserModel.findByIdAndUpdate(
    id,
    { name },
    { returnDocument: "after" }
  ).select("-password");

  if (!user) throw new Error("User not found");
  return user;
};

export const updatePassword = async (id: string, currentPassword: string, newPassword: string) => {
  const user = await UserModel.findById(id);
  if (!user) throw new Error("User not found");

  const isPasswordValid = await (user as any).comparePassword(currentPassword);
  if (!isPasswordValid) {
    throw new Error("Invalid current password");
  }

  user.password = newPassword;
  await user.save();

  return { message: "Password updated successfully" };
};
