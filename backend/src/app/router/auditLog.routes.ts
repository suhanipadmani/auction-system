import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";
import { paginationMiddleware } from "../middleware/pagination.middleware";
import { asyncHandler } from "../utils/asyncHandler";
import * as AuditLogController from "../controllers/auditLog.controller";

const router = Router();

// Only Admins can access audit logs
router.get("/", authenticate, authorize(["admin"]), paginationMiddleware, asyncHandler(AuditLogController.getLogs));

export const auditLogRoutes = router;
