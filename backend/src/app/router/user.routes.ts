import { Router } from "express";

// Middlewares
import { validate } from "../middleware/validate.middleware";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";

// Validator
import { createUserSchema, updateUserRoleSchema } from "../validators/user.validator";

// Controller
import * as userController from "../controllers/user.controller";


export const userRoutes = Router();

// All user routes require authentication and admin role
userRoutes.use(authenticate);
userRoutes.use(authorize(["admin"]));

userRoutes.post("/", validate(createUserSchema), userController.create);
userRoutes.get("/", userController.getAll);
userRoutes.patch("/:id/role", validate(updateUserRoleSchema), userController.updateRole);

// Status management
userRoutes.patch("/:id/deactivate", userController.deactivate);  // block login (inactive)
userRoutes.patch("/:id/activate", userController.activate);    // restore login
userRoutes.delete("/:id", userController.softDelete);  // hide from system (deleted)
userRoutes.patch("/:id/restore", userController.restore);     // un-hide (active)
