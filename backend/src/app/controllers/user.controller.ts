import { Request, Response } from "express";
import * as UserService from "../services/user.service";
import { sendSuccess } from "../utils/apiResponse";
import { getPagingMeta } from "../utils/pagination";

export const create = async (req: Request, res: Response) => {
  const user = await UserService.createUser(req.body);
  sendSuccess(res, "User created successfully", user, 201);
};

export const getAll = async (req: Request, res: Response) => {
  const includeDeleted = req.query.includeDeleted === "true";
  const { page, limit } = (req as any).pagination;
  const search = req.query.search as string;

  const result = await UserService.getAllUsers(includeDeleted, { page, limit, search });
  sendSuccess(res, "Users retrieved", result.data, 200, getPagingMeta(result.total, page, limit));
};

export const updateRole = async (req: Request, res: Response) => {
  const user = await UserService.updateUserRole(req.params.id as string, req.body.role);
  sendSuccess(res, "User role updated", user);
};

export const deactivate = async (req: Request, res: Response) => {
  const user = await UserService.deactivateUser(req.params.id as string);
  sendSuccess(res, "User deactivated — login access blocked", user);
};

export const activate = async (req: Request, res: Response) => {
  const user = await UserService.activateUser(req.params.id as string);
  sendSuccess(res, "User activated — login access restored", user);
};

export const softDelete = async (req: Request, res: Response) => {
  const user = await UserService.softDeleteUser(req.params.id as string);
  sendSuccess(res, "User deleted — hidden from system", user);
};

export const restore = async (req: Request, res: Response) => {
  const user = await UserService.restoreUser(req.params.id as string);
  sendSuccess(res, "User restored — account is now active", user);
};
