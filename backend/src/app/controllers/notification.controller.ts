import { Request, Response } from "express";
import { NotificationService } from "../services/notification.service";
import { sendSuccess } from "../utils/apiResponse";
import { AppError, ErrorMessages } from "../errors";

export const getMyNotifications = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { page, limit } = req.query;
  const result = await NotificationService.getNotifications(userId, { 
    page: page ? Number(page) : 1, 
    limit: limit ? Number(limit) : 20 
  });
  
  sendSuccess(res, "Notifications retrieved", result.data, 200, {
    total: result.total,
    page: result.page,
    totalPages: result.totalPages
  });
};

export const markRead = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user!.id;
  const notification = await NotificationService.markAsRead(id as string, userId);
  
  if (!notification) {
    throw AppError.from(ErrorMessages.RESOURCE_NOT_FOUND("Notification"));
  }

  sendSuccess(res, "Notification marked as read", notification);
};

export const markAllRead = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  await NotificationService.markAllAsRead(userId);
  sendSuccess(res, "All notifications marked as read");
};
