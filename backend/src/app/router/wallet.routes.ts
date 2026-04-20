import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { paginationMiddleware } from "../middleware/pagination.middleware";
import { asyncHandler } from "../utils/asyncHandler";
import { depositRequestSchema } from "../validators/wallet.validator";
import * as walletController from "../controllers/wallet.controller";

export const walletRoutes = Router();

walletRoutes.use(authenticate);

walletRoutes.get("/balance", asyncHandler(walletController.getWallet));
walletRoutes.post("/deposit", validate(depositRequestSchema), asyncHandler(walletController.requestDeposit));
walletRoutes.post("/payout", asyncHandler(walletController.requestPayout));
walletRoutes.get("/transactions", paginationMiddleware, asyncHandler(walletController.getTransactions));
walletRoutes.get("/requests", paginationMiddleware, asyncHandler(walletController.getMyRequests));
walletRoutes.get("/payout-requests", paginationMiddleware, asyncHandler(walletController.getMyPayoutRequests));

