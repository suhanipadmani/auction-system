import { Schema, Types, model } from "mongoose";
import { TRANSACTION_TYPES, TRANSACTION_SOURCES, TRANSACTION_STATUSES } from "../enums";
import { ITransactionDocument } from "../types/models";

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
      enum: Object.values(TRANSACTION_TYPES), 
      required: true 
    },

    amount: { 
      type: Number, 
      required: true, 
      min: 0 
    },

    status: { 
      type: String, 
      enum: Object.values(TRANSACTION_STATUSES), 
      required: true, 
      default: TRANSACTION_STATUSES.SUCCESS 
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
      enum: Object.values(TRANSACTION_SOURCES),
      required: true,
      default: TRANSACTION_SOURCES.ADMIN,
      index: true
    },
    
  },
  { timestamps: true },
);

export const TransactionModel = model<ITransactionDocument>("Transaction", transactionSchema);
