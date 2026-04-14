import { InferSchemaType, Schema, Types, model } from "mongoose";

export const DEPOSIT_STATUSES = ["pending", "approved", "rejected"] as const;

export const depositRequestSchema = new Schema(
  {
    userId: { 
      type: Types.ObjectId, 
      ref: "User", 
      required: true, 
      index: true 
    },

    amount: { 
      type: Number, 
      required: true, 
      min: 0 
    },

    status: { 
      type: String, 
      enum: DEPOSIT_STATUSES, 
      required: true, 
      default: "pending" 
    },

    adminId: { 
      type: Types.ObjectId, 
      ref: "User", 
      default: null 
    },

    adminNote: { 
      type: String, 
      trim: true, 
      default: "" 
    },
    
  },
  { timestamps: true },
);

import { IDepositRequestDocument } from "../types/models";

export const DepositRequestModel = model<IDepositRequestDocument>("DepositRequest", depositRequestSchema);
