import { Router } from "express";
import { BudgetController } from "../controllers/budget.controller";
import { authenticate } from "../middleware/auth.middleware";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.use(authenticate);

router.get("/", asyncHandler(BudgetController.getAll));
router.post("/", asyncHandler(BudgetController.create));
router.patch("/:id", asyncHandler(BudgetController.update));
router.delete("/:id", asyncHandler(BudgetController.delete));
router.post("/:id/assign", asyncHandler(BudgetController.assignAuction));

export const budgetRoutes = router;
