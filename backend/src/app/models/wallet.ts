import { Schema, Types, model } from "mongoose";
import { IWalletDocument } from "../types/models";

export const walletSchema = new Schema(
  {
    userId: { 
      type: Types.ObjectId, 
      ref: "User", 
      required: true, 
      unique: true, 
      index: true 
    },

    balance: { 
      type: Number, 
      required: true, 
      default: 0, 
      min: 0 
    },

    lockedBalance: { 
      type: Number, 
      required: true, 
      default: 0, 
      min: 0 
    },

    isFrozen: { 
      type: Boolean, 
      required: true, 
      default: false 
    },
    
  },
  { timestamps: true },
);

export const WalletModel = model<IWalletDocument>("Wallet", walletSchema);
