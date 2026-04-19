import { Router } from "express";
import { validate } from "../middleware/validate.middleware";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";
import { paginationMiddleware } from "../middleware/pagination.middleware";
import { asyncHandler } from "../utils/asyncHandler";
import { createUserSchema, updateUserRoleSchema } from "../validators/user.validator";
import * as userController from "../controllers/user.controller";

export const userRoutes = Router();

// All user routes require authentication and admin role
userRoutes.use(authenticate);
userRoutes.use(authorize(["admin"]));

userRoutes.post("/", validate(createUserSchema), asyncHandler(userController.create));
userRoutes.get("/", paginationMiddleware, asyncHandler(userController.getAll));
userRoutes.patch("/:id/role", validate(updateUserRoleSchema), asyncHandler(userController.updateRole));

// Status management
userRoutes.patch("/:id/deactivate", asyncHandler(userController.deactivate));
userRoutes.patch("/:id/activate", asyncHandler(userController.activate));
userRoutes.delete("/:id", asyncHandler(userController.softDelete));
userRoutes.patch("/:id/restore", asyncHandler(userController.restore));
