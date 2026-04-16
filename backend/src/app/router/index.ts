import { Router } from "express";

// Routes
import { authRoutes } from "./auth.routes";
import { userRoutes } from "./user.routes";
import { walletRoutes } from "./wallet.routes";
import { adminWalletRoutes } from "./adminWallet.routes";
import { auctionRoutes } from "./auction.routes";
import { bidRouter } from "./bid.routes";
import { budgetRoutes } from "./budget.routes";

export const appRouter = Router();

appRouter.get("/health", (_req, res) => {
  res.status(200).json({ success: true, message: "Auction API healthy" });
});

appRouter.use("/auth", authRoutes);
appRouter.use("/users", userRoutes);
appRouter.use("/wallet", walletRoutes);
appRouter.use("/admin/wallet", adminWalletRoutes);
appRouter.use("/auctions", auctionRoutes);
appRouter.use("/bids", bidRouter);
appRouter.use("/budgets", budgetRoutes);

