import { InferSchemaType, Schema, Types, model } from "mongoose";

export const NOTIFICATION_TYPES = ["outbid", "win", "loss", "auction_end"] as const;

const notificationSchema = new Schema(
  {
    userId: { 
      type: Types.ObjectId, 
      ref: "User", 
      required: true, 
      index: true 
    },

    type: { 
      type: String, 
      enum: NOTIFICATION_TYPES, 
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

export type NotificationDocument = InferSchemaType<typeof notificationSchema>;
export const NotificationModel = model("Notification", notificationSchema);
