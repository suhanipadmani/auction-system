import { Schema, Types, model } from "mongoose";
import { DEPOSIT_STATUSES } from "../enums";

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
      enum: Object.values(DEPOSIT_STATUSES), 
      required: true, 
      default: DEPOSIT_STATUSES.PENDING
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
