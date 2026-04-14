import { InferSchemaType, Schema, Types, model } from "mongoose";

const budgetSchema = new Schema(
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

export type BudgetDocument = InferSchemaType<typeof budgetSchema>;
export const BudgetModel = model("Budget", budgetSchema);
