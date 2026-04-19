import { Request, Response } from "express";
import * as UserService from "../services/user.service";
import { sendSuccess } from "../utils/apiResponse";
import { getPagingMeta } from "../utils/pagination";

// Utils
import { asyncHandler } from "../utils/asyncHandler";

export const create = asyncHandler(async (req: Request, res: Response) => {
  const user = await UserService.createUser(req.body);
  sendSuccess(res, "User created successfully", user, 201);
});

export const getAll = asyncHandler(async (req: Request, res: Response) => {
  const includeDeleted = req.query.includeDeleted === "true";
  const { page, limit } = (req as any).pagination;
  const search = req.query.search as string;

  const result = await UserService.getAllUsers(includeDeleted, { page, limit, search });
  sendSuccess(res, "Users retrieved", result.data, 200, getPagingMeta(result.total, page, limit));
});

export const updateRole = asyncHandler(async (req: Request, res: Response) => {
  const user = await UserService.updateUserRole(req.params.id as string, req.body.role);
  sendSuccess(res, "User role updated", user);
});

export const deactivate = asyncHandler(async (req: Request, res: Response) => {
  const user = await UserService.deactivateUser(req.params.id as string);
  sendSuccess(res, "User deactivated — login access blocked", user);
});

export const activate = asyncHandler(async (req: Request, res: Response) => {
  const user = await UserService.activateUser(req.params.id as string);
  sendSuccess(res, "User activated — login access restored", user);
});

export const softDelete = asyncHandler(async (req: Request, res: Response) => {
  const user = await UserService.softDeleteUser(req.params.id as string);
  sendSuccess(res, "User deleted — hidden from system", user);
});

export const restore = asyncHandler(async (req: Request, res: Response) => {
  const user = await UserService.restoreUser(req.params.id as string);
  sendSuccess(res, "User restored — account is now active", user);
});

export const updateMe = asyncHandler(async (req: Request, res: Response) => {
  const { name } = req.body;
  const user = await UserService.updateProfile(req.user!.id, name);
  sendSuccess(res, "Profile updated successfully", user);
});

export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  const result = await UserService.updatePassword(req.user!.id, currentPassword, newPassword);
  sendSuccess(res, "Password changed successfully", result);
});
