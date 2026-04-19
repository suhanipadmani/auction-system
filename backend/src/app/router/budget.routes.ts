import { Router } from "express";
import * as BudgetController from "../controllers/budget.controller";
import { authenticate } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { createBudgetSchema, updateBudgetSchema, assignAuctionSchema } from "../validators/budget.validator";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.use(authenticate);

router.get("/", asyncHandler(BudgetController.getAll));
router.post("/", validate(createBudgetSchema), asyncHandler(BudgetController.create));
router.patch("/:id", validate(updateBudgetSchema), asyncHandler(BudgetController.update));
router.delete("/:id", asyncHandler(BudgetController.deleteBudget));
router.post("/:id/assign", validate(assignAuctionSchema), asyncHandler(BudgetController.assignAuction));

export const budgetRoutes = router;
