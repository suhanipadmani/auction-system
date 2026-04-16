import { Router } from "express";

// Middlewares
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";
import { validate } from "../middleware/validate.middleware";
import { asyncHandler } from "../utils/asyncHandler";

// Validators 
import { createAuctionSchema, updateAuctionSchema, adminActionSchema } from "../validators/auction.validator";

// Controllers
import { AuctionController } from "../controllers/auction.controller";


export const auctionRoutes = Router();

// Public / Bidder Routes
auctionRoutes.get("/", asyncHandler(AuctionController.getAll));
auctionRoutes.get("/my-activity", authenticate, asyncHandler(AuctionController.getMyActivity));

// Seller Routes
auctionRoutes.get("/seller-stats", authenticate, authorize(["seller"]), asyncHandler(AuctionController.getSellerStats));

// Admin Stats (Must be before :id)
auctionRoutes.get("/admin-stats", authenticate, authorize(["admin"]), asyncHandler(AuctionController.getAdminStats));

// Get by ID must be after concrete routes
auctionRoutes.get("/:id", asyncHandler(AuctionController.getById));

auctionRoutes.post("/", authenticate, authorize(["seller"]), validate(createAuctionSchema), asyncHandler(AuctionController.create));
auctionRoutes.patch("/:id", authenticate, authorize(["seller"]), validate(updateAuctionSchema), asyncHandler(AuctionController.update));
auctionRoutes.delete("/:id", authenticate, authorize(["seller"]), asyncHandler(AuctionController.cancel));
auctionRoutes.patch("/:id/finalize", authenticate, authorize(["seller"]), asyncHandler(AuctionController.finalize));


// Admin Routes
auctionRoutes.get("/admin-stats", authenticate, authorize(["admin"]), asyncHandler(AuctionController.getAdminStats));
auctionRoutes.get("/admin/inventory", authenticate, authorize(["admin"]), asyncHandler(AuctionController.getAdminInventory));
auctionRoutes.patch("/:id/approve", authenticate, authorize(["admin"]), validate(adminActionSchema), asyncHandler(AuctionController.adminApproveAction));
auctionRoutes.patch("/:id/force-action", authenticate, authorize(["admin"]), asyncHandler(AuctionController.adminForceAction));
