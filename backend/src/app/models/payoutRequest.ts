import { Schema, Types, model } from "mongoose";
import { PAYOUT_STATUSES } from "../enums";

export const payoutRequestSchema = new Schema(
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
      enum: Object.values(PAYOUT_STATUSES), 
      required: true, 
      default: PAYOUT_STATUSES.PENDING
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

import { IPayoutRequestDocument } from "../types/models";

export const PayoutRequestModel = model<IPayoutRequestDocument>("PayoutRequest", payoutRequestSchema);
