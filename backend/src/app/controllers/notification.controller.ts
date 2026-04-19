import { Request, Response } from "express";
import { NotificationService } from "../services/notification.service";
import { sendSuccess } from "../utils/apiResponse";
import { AppError } from "../utils/AppError";

export const getMyNotifications = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const notifications = await NotificationService.getNotifications(userId);
  sendSuccess(res, "Notifications retrieved", notifications);
};

export const markRead = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user!.id;
  const notification = await NotificationService.markAsRead(id as string, userId);
  
  if (!notification) {
    throw new AppError("Notification not found", 404);
  }

  sendSuccess(res, "Notification marked as read", notification);
};

export const markAllRead = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  await NotificationService.markAllAsRead(userId);
  sendSuccess(res, "All notifications marked as read");
};
