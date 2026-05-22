import { NOTIFICATION_TYPES } from "../enums";
import { SocketService } from "./socket.service";
import { UserModel } from "../models/user";
import { NotificationModel } from "../models/notification";

export class NotificationService {
  /**
   * 1. Persists to Database (Hybrid Approach)
   * 2. Emits real-time socket event
   */
  static async sendNotification(userId: string, type: NOTIFICATION_TYPES, message: string, link?: string) {
    try {
      // 1. Save to Database
      const notification = await NotificationModel.create({
        userId,
        type,
        message,
        link,
        isRead: false
      });

      // 2. Emit via Socket (Structured Event)
      SocketService.emitToUser(userId, "notification", {
        type: "NOTIFICATION_RECEIVED",
        payload: {
          id: notification._id,
          type: notification.type,
          message: notification.message,
          link: notification.link,
          createdAt: notification.createdAt,
          isRead: notification.isRead
        },
        timestamp: Date.now()
      });

      return notification;
    } catch (error) {
      console.error("[NOTIFICATION-SERVICE] Failed to send notification:", error);
    }
  }

  static async notifyAdmins(type: NOTIFICATION_TYPES, message: string, link?: string) {
    try {
      const admins = await UserModel.find({ role: "admin" }).select("_id");
      
      const notificationPromises = admins.map(admin => 
        this.sendNotification(admin._id.toString(), type, message, link)
      );

      await Promise.all(notificationPromises);
    } catch (error) {
      console.error("[NOTIFICATION-SERVICE] Failed to notify admins:", error);
    }
  }

  static async getNotifications(userId: string, options: { page?: number; limit?: number } = {}) {
    const { page = 1, limit = 20 } = options;
    const skip = (page - 1) * limit;

    const [data, total, unreadCount] = await Promise.all([
      NotificationModel.find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      NotificationModel.countDocuments({ userId }),
      NotificationModel.countDocuments({ userId, isRead: false })
    ]);

    return { data, total, unreadCount, page, totalPages: Math.ceil(total / limit) };
  }

  static async markAsRead(notificationId: string, userId: string) {
    return await NotificationModel.findOneAndUpdate(
      { _id: notificationId, userId },
      { isRead: true },
      { new: true }
    );
  }

  static async markAllAsRead(userId: string) {
    return await NotificationModel.updateMany({ userId }, { isRead: true });
  }
}
