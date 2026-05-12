import { Schema, Types, model } from "mongoose";
import { AUCTION_STATUSES } from "../enums";
import { IAuctionDocument } from "../types/models";

export const auctionSchema = new Schema(
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
      required: true,
      index: true
    },

    endTime: { 
      type: Date, 
      required: true 
    },

    status: { 
      type: String, 
      enum: Object.values(AUCTION_STATUSES), 
      default: AUCTION_STATUSES.PENDING, 
      required: true,
      index: true
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
    
    endingSoonNotified: {
      type: Boolean,
      default: false
    },

    bidCount: {
      type: Number,
      default: 0,
      index: true
    },
    
  },
  { timestamps: true },
);

export const AuctionModel = model<IAuctionDocument>("Auction", auctionSchema);
