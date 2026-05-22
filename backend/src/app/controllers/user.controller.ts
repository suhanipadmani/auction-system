import { Request, Response } from "express";
import * as UserService from "../services/user.service";
import { SuccessMessages } from "../constants/successMessages";
// Utils
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/apiResponse";
import { getPagingMeta } from "../utils/pagination";

export const create = asyncHandler(async (req: Request, res: Response) => {
  const user = await UserService.createUser(req.body);
  sendSuccess(res, SuccessMessages.USER_CREATED, user, 201);
});

export const getAll = asyncHandler(async (req: Request, res: Response) => {
  const includeDeleted = req.query.includeDeleted === "true";
  const { page, limit } = (req as any).pagination;
  const search = req.query.search as string;

  const result = await UserService.getAllUsers(includeDeleted, { page, limit, search });
  sendSuccess(res, SuccessMessages.USERS_RETRIEVED, result.data, 200, getPagingMeta(result.total, page, limit));
});

export const updateRole = asyncHandler(async (req: Request, res: Response) => {
  const user = await UserService.updateUserRole(req.params.id as string, req.body.role);
  sendSuccess(res, SuccessMessages.USER_ROLE_UPDATED, user);
});

export const deactivate = asyncHandler(async (req: Request, res: Response) => {
  const user = await UserService.deactivateUser(req.params.id as string);
  sendSuccess(res, SuccessMessages.USER_DEACTIVATED, user);
});

export const activate = asyncHandler(async (req: Request, res: Response) => {
  const user = await UserService.activateUser(req.params.id as string);
  sendSuccess(res, SuccessMessages.USER_ACTIVATED, user);
});

export const softDelete = asyncHandler(async (req: Request, res: Response) => {
  const user = await UserService.softDeleteUser(req.params.id as string);
  sendSuccess(res, SuccessMessages.USER_DELETED, user);
});

export const restore = asyncHandler(async (req: Request, res: Response) => {
  const user = await UserService.restoreUser(req.params.id as string);
  sendSuccess(res, SuccessMessages.USER_RESTORED, user);
});

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const user = await UserService.getUserById(req.user!.id);
  sendSuccess(res, SuccessMessages.PROFILE_RETRIEVED, user);
});

export const updateMe = asyncHandler(async (req: Request, res: Response) => {
  const { name, preferredLanguage } = req.body;
  const user = await UserService.updateProfile(req.user!.id, { name, preferredLanguage });
  sendSuccess(res, SuccessMessages.PROFILE_UPDATED, user);
});

export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  const result = await UserService.updatePassword(req.user!.id, currentPassword, newPassword);
  sendSuccess(res, SuccessMessages.PASSWORD_CHANGED, result);
});

