import { Router } from "express";
import { validate } from "../middleware/validate.middleware";
import { registerSchema, loginSchema } from "../validators/auth.validator";
import * as authController from "../controllers/auth.controller";

export const authRoutes = Router();

authRoutes.post("/register", validate(registerSchema), authController.register);
authRoutes.post("/login", validate(loginSchema), authController.login);
authRoutes.post("/logout", authController.logout);
