import { InferSchemaType, Schema, Types, model } from "mongoose";

export const TRANSACTION_TYPES = ["credit", "debit", "lock", "unlock"] as const;
export const TRANSACTION_SOURCES = ["deposit", "admin", "bid"] as const;
export const TRANSACTION_STATUSES = ["success", "failed"] as const;

export const transactionSchema = new Schema(
  {
    userId: { 
      type: Types.ObjectId, 
      ref: "User", 
      required: true, 
      index: true 
    },

    type: { 
      type: String, 
      enum: TRANSACTION_TYPES, 
      required: true 
    },

    amount: { 
      type: Number, 
      required: true, 
      min: 0 
    },

    status: { 
      type: String, 
      enum: TRANSACTION_STATUSES, 
      required: true, 
      default: "success" 
    },

    referenceId: { 
      type: Types.ObjectId, 
      default: null 
    },

    adminId: { 
      type: Types.ObjectId, 
      ref: "User",
      default: null 
    },

    note: { 
      type: String, 
      trim: true,
      default: "" 
    },

    source: {
      type: String,
      enum: TRANSACTION_SOURCES,
      required: true,
      default: "admin",
      index: true
    },
    
  },
  { timestamps: true },
);

import { ITransactionDocument } from "../types/models";

export const TransactionModel = model<ITransactionDocument>("Transaction", transactionSchema);
