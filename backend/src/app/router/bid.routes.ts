import { Router } from "express";
import * as BidController from "../controllers/bid.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";
import { validate } from "../middleware/validate.middleware";
import { placeBidSchema, setupAutoBidSchema } from "../validators/bid.validator";
import { bidLimiter } from "../middleware/rateLimit.middleware";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

// All bidding routes require authentication
router.post("/place", authenticate, bidLimiter, validate(placeBidSchema), asyncHandler(BidController.placeBid));
router.post("/auto-setup", authenticate, bidLimiter, validate(setupAutoBidSchema), asyncHandler(BidController.setupAutoBid));
router.get("/status/:auctionId", authenticate, asyncHandler(BidController.getBidStatus));
router.delete("/admin/:id", authenticate, authorize(["admin"]), asyncHandler(BidController.removeBid));

export const bidRouter = router;

