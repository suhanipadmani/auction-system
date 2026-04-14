import { Router } from "express";
import * as userController from "../controllers/user.controller";
import { validate } from "../middleware/validate.middleware";
import { createUserSchema, updateUserRoleSchema } from "../validators/user.validator";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";

export const userRoutes = Router();

// All user routes require authentication and admin role
userRoutes.use(authenticate);
userRoutes.use(authorize(["admin"]));

userRoutes.post("/", validate(createUserSchema), userController.create);
userRoutes.get("/", userController.getAll);
userRoutes.patch("/:id/role", validate(updateUserRoleSchema), userController.updateRole);
userRoutes.delete("/:id", userController.deactivate);
