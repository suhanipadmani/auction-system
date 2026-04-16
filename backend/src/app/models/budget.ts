import { Schema, Types, model } from "mongoose";

export const budgetSchema = new Schema(
  {
    userId: { 
      type: Types.ObjectId, 
      ref: "User", 
      required: true, 
      index: true 
    },

    name: { 
      type: String, 
      required: true,
      trim: true
    },

    maxBudget: { 
      type: Number, 
      required: true, 
      min: 0 
    },

    auctionIds: [
      { 
        type: Types.ObjectId, 
        ref: "Auction" 
      }
    ],
    
  },
  { timestamps: true },
);

// Compound index to prevent duplicate goal names for the same user
budgetSchema.index({ userId: 1, name: 1 }, { unique: true });

import { IBudgetDocument } from "../types/models";

export const BudgetModel = model<IBudgetDocument>("Budget", budgetSchema);
