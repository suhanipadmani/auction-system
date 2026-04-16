import { Router } from "express";

// Middlewares
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";
import { validate } from "../middleware/validate.middleware";

// Validators 
import { createAuctionSchema, updateAuctionSchema, adminActionSchema } from "../validators/auction.validator";

// Controllers
import { AuctionController } from "../controllers/auction.controller";


export const auctionRoutes = Router();

// Public / Bidder Routes
auctionRoutes.get("/", AuctionController.getAll);
auctionRoutes.get("/:id", AuctionController.getById);

// Seller Routes
const sellerRoutes = Router();
sellerRoutes.use(authenticate, authorize(["seller"]));

sellerRoutes.post("/", validate(createAuctionSchema), AuctionController.create);
sellerRoutes.patch("/:id", validate(updateAuctionSchema), AuctionController.update);
sellerRoutes.delete("/:id", AuctionController.cancel);

auctionRoutes.use(sellerRoutes);

// Admin Routes
const adminRoutes = Router();
adminRoutes.use(authenticate, authorize(["admin"]));

adminRoutes.patch("/:id/approve", validate(adminActionSchema), AuctionController.adminApproveAction);
adminRoutes.patch("/:id/force-action", AuctionController.adminForceAction);

auctionRoutes.use(adminRoutes);
