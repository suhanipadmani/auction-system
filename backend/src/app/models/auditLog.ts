import { InferSchemaType, Schema, Types, model } from "mongoose";

export const AUDIT_ACTIONS = ["BID_PLACED", "AUCTION_CREATED", "WALLET_UPDATED"] as const;

export const auditLogSchema = new Schema(
  {
    userId: { 
      type: Types.ObjectId, 
      ref: "User", 
      required: true, 
      index: true 
    },

    action: { 
      type: String, 
      enum: AUDIT_ACTIONS, 
      required: true 
    },

    metadata: { 
      type: Schema.Types.Mixed, 
      default: {} 
    },
    
  },
  { timestamps: true },
);

import { IAuditLogDocument } from "../types/models";

export const AuditLogModel = model<IAuditLogDocument>("AuditLog", auditLogSchema);
