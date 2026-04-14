import { Router } from "express";
import { AuctionController } from "../controllers/auction.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";
import { validate } from "../middleware/validate.middleware";
import { createAuctionSchema, updateAuctionSchema, adminActionSchema } from "../validators/auction.validator";

export const auctionRoutes = Router();

// Public / Bidder Routes
auctionRoutes.get("/", AuctionController.getAll);
auctionRoutes.get("/:id", AuctionController.getById);

// Seller Routes
auctionRoutes.post(
  "/",
  authenticate,
  authorize(["seller"]),
  validate(createAuctionSchema),
  AuctionController.create
);

auctionRoutes.patch(
  "/:id",
  authenticate,
  authorize(["seller"]),
  validate(updateAuctionSchema),
  AuctionController.update
);

auctionRoutes.delete(
  "/:id",
  authenticate,
  authorize(["seller"]),
  AuctionController.cancel
);

// Admin Routes
auctionRoutes.patch(
  "/:id/approve",
  authenticate,
  authorize(["admin"]),
  validate(adminActionSchema),
  AuctionController.adminApproveAction
);

auctionRoutes.patch(
  "/:id/force-action",
  authenticate,
  authorize(["admin"]),
  AuctionController.adminForceAction
);
