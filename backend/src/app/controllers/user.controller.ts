import { Request, Response } from "express";

// Utils
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/apiResponse";

// Services
import {
  createUser,
  getAllUsers,
  updateUserRole,
  deactivateUser,
  activateUser,
  softDeleteUser,
  restoreUser,
} from "../services/user.service";

export const create = asyncHandler(async (req: Request, res: Response) => {
  const user = await createUser(req.body);
  sendSuccess(res, "User created successfully", user, 201);
});

export const getAll = asyncHandler(async (req: Request, res: Response) => {
  const includeDeleted = req.query.includeDeleted === "true";
  const users = await getAllUsers(includeDeleted);
  sendSuccess(res, "Users retrieved", users);
});

export const updateRole = asyncHandler(async (req: Request, res: Response) => {
  const user = await updateUserRole(req.params.id as string, req.body.role);
  sendSuccess(res, "User role updated", user);
});

/** PATCH /:id/deactivate — blocks user login access (status - inactive) */
export const deactivate = asyncHandler(async (req: Request, res: Response) => {
  const user = await deactivateUser(req.params.id as string);
  sendSuccess(res, "User deactivated — login access blocked", user);
});

/** PATCH /:id/activate — restores login access for a deactivated user */
export const activate = asyncHandler(async (req: Request, res: Response) => {
  const user = await activateUser(req.params.id as string);
  sendSuccess(res, "User activated — login access restored", user);
});

/** DELETE /:id — soft-deletes the user (hidden from system, data preserved) */
export const softDelete = asyncHandler(async (req: Request, res: Response) => {
  const user = await softDeleteUser(req.params.id as string);
  sendSuccess(res, "User deleted — hidden from system", user);
});

/** PATCH /:id/restore — makes a soft-deleted user active again */
export const restore = asyncHandler(async (req: Request, res: Response) => {
  const user = await restoreUser(req.params.id as string);
  sendSuccess(res, "User restored — account is now active", user);
});
