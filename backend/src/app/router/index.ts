import { Router } from "express";
import { apiLimiter } from "../middleware/rateLimit.middleware";

// Routes
import { authRoutes } from "./auth.routes";
import { userRoutes } from "./user.routes";
import { walletRoutes } from "./wallet.routes";
import { adminWalletRoutes } from "./adminWallet.routes";
import { auctionRoutes } from "./auction.routes";
import { bidRouter } from "./bid.routes";
import { budgetRoutes } from "./budget.routes";
import { notificationRouter } from "./notification.routes";
import { auditLogRoutes } from "./auditLog.routes";

export const appRouter = Router();

// Apply general rate limiter to all api routes
appRouter.use(apiLimiter);

appRouter.use("/auth", authRoutes);
appRouter.use("/users", userRoutes);
appRouter.use("/wallet", walletRoutes);
appRouter.use("/admin/wallet", adminWalletRoutes);
appRouter.use("/auctions", auctionRoutes);
appRouter.use("/bids", bidRouter);
appRouter.use("/budgets", budgetRoutes);
appRouter.use("/notifications", notificationRouter);
appRouter.use("/admin/audit-logs", auditLogRoutes);

