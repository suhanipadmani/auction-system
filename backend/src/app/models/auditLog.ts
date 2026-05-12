import { Schema, Types, model } from "mongoose";
import { AUDIT_ACTIONS } from "../enums";
import { IAuditLogDocument } from "../types/models";

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
      enum: Object.values(AUDIT_ACTIONS), 
      required: true 
    },

    metadata: { 
      type: Schema.Types.Mixed, 
      default: {} 
    },
    
  },
  { timestamps: true },
);

export const AuditLogModel = model<IAuditLogDocument>("AuditLog", auditLogSchema);
