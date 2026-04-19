import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";
import { validate } from "../middleware/validate.middleware";
import { paginationMiddleware } from "../middleware/pagination.middleware";
import { asyncHandler } from "../utils/asyncHandler";
import { adjustBalanceSchema } from "../validators/wallet.validator";
import * as adminWalletController from "../controllers/adminWallet.controller";

export const adminWalletRoutes = Router();

adminWalletRoutes.use(authenticate);
adminWalletRoutes.use(authorize(["admin"]));

adminWalletRoutes.get("/pending-deposits", paginationMiddleware, asyncHandler(adminWalletController.getPendingDeposits));
adminWalletRoutes.get("/transactions", paginationMiddleware, asyncHandler(adminWalletController.getSystemTransactions));
adminWalletRoutes.get("/user/:userId", asyncHandler(adminWalletController.getUserAdminWallet));
adminWalletRoutes.post("/process-deposit", asyncHandler(adminWalletController.approveRejectDeposit));
adminWalletRoutes.post("/adjust-balance", validate(adjustBalanceSchema), asyncHandler(adminWalletController.adjustBalance));
adminWalletRoutes.post("/toggle-freeze", asyncHandler(adminWalletController.freezeUnfreezeWallet));

