import { Router } from "express";
import * as adminWalletController from "../controllers/adminWallet.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";

export const adminWalletRoutes = Router();

adminWalletRoutes.use(authenticate);
adminWalletRoutes.use(authorize(["admin"]));

adminWalletRoutes.get("/pending-deposits", adminWalletController.getPendingDeposits);
adminWalletRoutes.get("/transactions", adminWalletController.getSystemTransactions);
adminWalletRoutes.get("/user/:userId", adminWalletController.getUserAdminWallet);
adminWalletRoutes.post("/process-deposit", adminWalletController.approveRejectDeposit);
adminWalletRoutes.post("/adjust-balance", adminWalletController.adjustBalance);
adminWalletRoutes.post("/toggle-freeze", adminWalletController.freezeUnfreezeWallet);
