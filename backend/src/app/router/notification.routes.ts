import { Router } from "express";
import * as NotificationController from "../controllers/notification.controller";
import { authenticate } from "../middleware/auth.middleware";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.use(authenticate);

router.get("/", asyncHandler(NotificationController.getMyNotifications));
router.patch("/read-all", asyncHandler(NotificationController.markAllRead));
router.patch("/:id/read", asyncHandler(NotificationController.markRead));

export const notificationRouter = router;
