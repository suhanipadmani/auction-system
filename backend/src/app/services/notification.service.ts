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

  static async getNotifications(userId: string, limit = 20) {
    return await NotificationModel.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit);
  }

  static async markAsRead(notificationId: string, userId: string) {
    // UPDATED: Automatically delete after viewing/reading
    return await NotificationModel.findOneAndDelete({ _id: notificationId, userId });
  }

  static async markAllAsRead(userId: string) {
    // UPDATED: Automatically delete after "Mark all as read"
    return await NotificationModel.deleteMany({ userId });
  }
}
