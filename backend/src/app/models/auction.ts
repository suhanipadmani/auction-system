import { InferSchemaType, Schema, Types, model } from "mongoose";

export const AUCTION_STATUSES = ["pending", "active", "ended", "cancelled"] as const;

const auctionSchema = new Schema(
  {
    title: { 
      type: String, 
      required: true,
       trim: true 
    },

    description: {
      type: String, 
      required: true, 
      trim: true 
    },

    sellerId: { 
      type: Types.ObjectId, 
      ref: "User", 
      required: true, 
      index: true 
    },

    basePrice: { 
      type: Number, 
      required: true, 
      min: 0 
    },

    minIncrement: { 
      type: Number, 
      required: true, 
      min: 1 
    },

    startTime: { 
      type: Date, 
      required: true 
    },

    endTime: { 
      type: Date, 
      required: true 
    },

    status: { 
      type: String, 
      enum: AUCTION_STATUSES, 
      default: "pending", 
      required: true 
    },

    highestBid: { 
      type: Number, 
      default: 0, 
      min: 0 
    },

    highestBidderId: { 
      type: Types.ObjectId, 
      ref: "User", 
      default: null 
    },

    isApproved: { 
      type: Boolean, 
      default: false 
    },

    isRejected: { 
      type: Boolean, 
      default: false 
    },
    
  },
  { timestamps: true },
);

export type AuctionDocument = InferSchemaType<typeof auctionSchema>;
export const AuctionModel = model("Auction", auctionSchema);
