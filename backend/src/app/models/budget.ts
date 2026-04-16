import { Schema, Types, model } from "mongoose";

export const budgetSchema = new Schema(
  {
    userId: { 
      type: Types.ObjectId, 
      ref: "User", 
      required: true, 
      unique: true, 
      index: true 
    },

    maxBudget: { 
      type: Number, 
      required: true, 
      min: 0 
    },

    currentExposure: { 
      type: Number, 
      required: true, 
      default: 0, 
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

import { IBudgetDocument } from "../types/models";

export const BudgetModel = model<IBudgetDocument>("Budget", budgetSchema);
