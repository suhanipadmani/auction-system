import { InferSchemaType, Schema, Types, model } from "mongoose";

export const BID_STATUSES = ["active", "outbid", "won", "lost"] as const;

const bidSchema = new Schema(
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
      min: 0 
    },

    status: { 
      type: String, 
      enum: BID_STATUSES, 
      required: true, 
      default: "active" 
    },
    
  },
  { timestamps: true },
);

export type BidDocument = InferSchemaType<typeof bidSchema>;
export const BidModel = model("Bid", bidSchema);
