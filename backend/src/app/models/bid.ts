import { Schema, Types, model } from "mongoose";
import { BID_STATUSES } from "../enums";
import { IBidDocument } from "../types/models";

export const bidSchema = new Schema(
  {
    auctionId: { 
      type: Types.ObjectId, 
      ref: "Auction", 
      required: true, 
      index: true 
    },

    bidderId: { 
      type: Types.ObjectId, 
      ref: "User", 
      required: true, 
      index: true 
    
    },
    amount: { 
      type: Number, 
      required: true, 
      min: 0 
    },

    isAutoBid: { 
      type: Boolean, 
      default: false 
    },

    autoBidLimit: { 
      type: Number, 
      default: null, 
      min: 0,
      select: false
    },

    status: { 
      type: String, 
      enum: Object.values(BID_STATUSES), 
      required: true, 
      default: BID_STATUSES.ACTIVE
    },
    
  },
  { timestamps: true },
);

export const BidModel = model<IBidDocument>("Bid", bidSchema);
