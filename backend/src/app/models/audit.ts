import { InferSchemaType, Schema, Types, model } from "mongoose";

export const AUDIT_ACTIONS = ["BID_PLACED", "AUCTION_CREATED", "WALLET_UPDATED"] as const;

const auditLogSchema = new Schema(
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

export type AuditLogDocument = InferSchemaType<typeof auditLogSchema>;
export const AuditLogModel = model("AuditLog", auditLogSchema);
