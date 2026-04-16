import { Schema, Types, model } from "mongoose";
import { NOTIFICATION_TYPES } from "../enums";

export const notificationSchema = new Schema(
  {
    userId: { 
      type: Types.ObjectId, 
      ref: "User", 
      required: true, 
      index: true 
    },

    type: { 
      type: String, 
      enum: Object.values(NOTIFICATION_TYPES), 
      required: true 
    },

    message: { 
      type: String, 
      required: true, 
      trim: true 
    },

    isRead: { 
      type: Boolean, 
      default: false 
    },
    
  },
  { timestamps: true },
);

import { INotificationDocument } from "../types/models";

export const NotificationModel = model<INotificationDocument>("Notification", notificationSchema);
