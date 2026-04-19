import { Router } from "express";
import { validate } from "../middleware/validate.middleware";
import { registerSchema, loginSchema } from "../validators/auth.validator";
import * as authController from "../controllers/auth.controller";
import { loginLimiter, registerLimiter } from "../middleware/rateLimit.middleware";

export const authRoutes = Router();

authRoutes.post("/register", registerLimiter, validate(registerSchema), authController.register);
authRoutes.post("/login", loginLimiter, validate(loginSchema), authController.login);
authRoutes.post("/logout", authController.logout);
authRoutes.post("/forgot-password", authController.requestPasswordReset);
authRoutes.post("/reset-password", authController.handleResetPassword);

