import { Router } from "express";

// Middlewares
import { authenticate } from "../middleware/auth.middleware";

// Controllers
import * as walletController from "../controllers/wallet.controller";

export const walletRoutes = Router();

walletRoutes.use(authenticate);

walletRoutes.get("/balance", walletController.getWallet);
walletRoutes.post("/deposit", walletController.requestDeposit);
walletRoutes.get("/transactions", walletController.getTransactions);
walletRoutes.get("/requests", walletController.getMyRequests);
