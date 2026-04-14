import { InferSchemaType, Schema, Types, model } from "mongoose";

export const TRANSACTION_TYPES = ["credit", "debit", "lock", "unlock"] as const;
export const TRANSACTION_STATUSES = ["success", "failed"] as const;

const transactionSchema = new Schema(
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
    
  },
  { timestamps: true },
);

export type TransactionDocument = InferSchemaType<typeof transactionSchema>;
export const TransactionModel = model("Transaction", transactionSchema);
