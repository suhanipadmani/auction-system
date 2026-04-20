import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";
import { validate } from "../middleware/validate.middleware";
import { asyncHandler } from "../utils/asyncHandler";
import { paginationMiddleware } from "../middleware/pagination.middleware";
import { createAuctionSchema, updateAuctionSchema, adminActionSchema } from "../validators/auction.validator";
import * as AuctionController from "../controllers/auction.controller";

export const auctionRoutes = Router();

// Public / Bidder Routes
auctionRoutes.get("/", paginationMiddleware, asyncHandler(AuctionController.getAuctions));
auctionRoutes.get("/public-stats", asyncHandler(AuctionController.getPublicStats));
auctionRoutes.get("/my-activity", authenticate, asyncHandler(AuctionController.getMyActivity));

// Seller Routes
auctionRoutes.get("/seller-stats", authenticate, authorize(["seller"]), asyncHandler(AuctionController.getSellerStats));

// Admin Stats
auctionRoutes.get("/admin-stats", authenticate, authorize(["admin"]), asyncHandler(AuctionController.getAdminStats));

// Get by ID must be after concrete routes
auctionRoutes.get("/:id", asyncHandler(AuctionController.getAuctionById));
auctionRoutes.get("/:id/bids", paginationMiddleware, asyncHandler(AuctionController.getAuctionBids));

auctionRoutes.post("/", authenticate, authorize(["seller"]), validate(createAuctionSchema), asyncHandler(AuctionController.createAuction));
auctionRoutes.patch("/:id", authenticate, authorize(["seller"]), validate(updateAuctionSchema), asyncHandler(AuctionController.updateAuction));
auctionRoutes.delete("/:id", authenticate, authorize(["seller", "admin"]), asyncHandler(AuctionController.cancelAuction));
auctionRoutes.patch("/:id/finalize", authenticate, authorize(["seller"]), asyncHandler(AuctionController.finalizeAuction));

// Admin Routes
auctionRoutes.get("/admin/inventory", authenticate, authorize(["admin"]), paginationMiddleware, asyncHandler(AuctionController.getAdminInventory));
auctionRoutes.patch("/:id/approve", authenticate, authorize(["admin"]), validate(adminActionSchema), asyncHandler(AuctionController.approveRejectAuction));
auctionRoutes.patch("/:id/force-action", authenticate, authorize(["admin"]), asyncHandler(AuctionController.forceAction));
