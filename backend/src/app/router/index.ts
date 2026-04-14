import { Router } from "express";
import { authRoutes } from "./auth.routes";
import { userRoutes } from "./user.routes";

export const appRouter = Router();

appRouter.get("/health", (_req, res) => {
  res.status(200).json({ success: true, message: "Auction API healthy" });
});

appRouter.use("/auth", authRoutes);
appRouter.use("/users", userRoutes);

