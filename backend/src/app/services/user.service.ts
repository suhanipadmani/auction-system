import bcrypt from "bcrypt";
import { USER_STATUSES } from "../enums";
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

/**
 * Returns all users.
 * By default excludes DELETED users (hidden from system).
 * INACTIVE users are always visible — they are blocked but not hidden.
 */
export const getAllUsers = async (includeDeleted = false) => {
  const filter = includeDeleted ? {} : { status: { $ne: USER_STATUSES.DELETED } };
  return await UserModel.find(filter).select("-password").sort({ createdAt: -1 });
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
