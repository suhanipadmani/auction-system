import { Router } from "express";
import { BidController } from "../controllers/bid.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

// All bidding routes require authentication
router.post("/place", authenticate, BidController.placeBid);
router.post("/auto-setup", authenticate, BidController.setupAutoBid);
router.get("/status/:auctionId", authenticate, BidController.getBidStatus);

export const bidRouter = router;
