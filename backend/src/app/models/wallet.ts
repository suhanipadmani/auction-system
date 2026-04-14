import { InferSchemaType, Schema, Types, model } from "mongoose";

const walletSchema = new Schema(
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

export type WalletDocument = InferSchemaType<typeof walletSchema>;
export const WalletModel = model("Wallet", walletSchema);
