import { Router } from "express";
import * as walletController from "../controllers/wallet.controller";
import { authenticate } from "../middleware/auth.middleware";

export const walletRoutes = Router();

walletRoutes.use(authenticate);

walletRoutes.get("/balance", walletController.getWallet);
walletRoutes.post("/deposit", walletController.requestDeposit);
walletRoutes.get("/transactions", walletController.getTransactions);
walletRoutes.get("/requests", walletController.getMyRequests);
