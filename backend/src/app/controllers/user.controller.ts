import { Request, Response, NextFunction } from "express";
import { createUser, getAllUsers, updateUserRole, deactivateUser } from "../services/user.service";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/apiResponse";

export const create = asyncHandler(async (req: Request, res: Response) => {
  const user = await createUser(req.body);
  sendSuccess(res, "User created successfully", user, 201);
});

export const getAll = asyncHandler(async (req: Request, res: Response) => {
  const users = await getAllUsers();
  sendSuccess(res, "Users retrieved", users);
});

export const updateRole = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id;
  const user = await updateUserRole(id as string, req.body.role);
  sendSuccess(res, "User role updated", user);
});

export const deactivate = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id;
  const user = await deactivateUser(id as string);
  sendSuccess(res, "User deactivated", user);
});
