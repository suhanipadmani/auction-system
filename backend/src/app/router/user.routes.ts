import { Router } from "express";
import { validate } from "../middleware/validate.middleware";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";
import { paginationMiddleware } from "../middleware/pagination.middleware";
import { asyncHandler } from "../utils/asyncHandler";
import { createUserSchema, updateUserRoleSchema } from "../validators/user.validator";
import * as userController from "../controllers/user.controller";

export const userRoutes = Router();

// All user routes require authentication
userRoutes.use(authenticate);

// Profile and security (Any authenticated user)
userRoutes.patch("/me", userController.updateMe);
userRoutes.patch("/me/password", userController.changePassword);

// Admin-only routes
userRoutes.use(authorize(["admin"]));

userRoutes.post("/", validate(createUserSchema), userController.create);
userRoutes.get("/", paginationMiddleware, userController.getAll);
userRoutes.patch("/:id/role", validate(updateUserRoleSchema), userController.updateRole);

// Status management
userRoutes.patch("/:id/deactivate", userController.deactivate);
userRoutes.patch("/:id/activate", userController.activate);
userRoutes.delete("/:id", userController.softDelete);
userRoutes.patch("/:id/restore", userController.restore);
