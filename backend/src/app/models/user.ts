import { InferSchemaType, Schema, model } from "mongoose";

export const USER_ROLES = ["admin", "seller", "bidder"] as const;
export const USER_STATUSES = ["active", "deleted"] as const;

const userSchema = new Schema(
  {
    name: { 
      type: String, 
      required: true, 
      trim: true 
    },

    email: { 
      type: String, 
      required: true, 
      unique: true, 
      lowercase: true, 
      trim: true 
    },

    password: { 
      type: String, 
      required: true 
    },

    role: { 
      type: String, 
      enum: USER_ROLES, 
      default: "bidder", 
      required: true 
    },
    
    status: { 
      type: String, 
      enum: USER_STATUSES, 
      default: "active", 
      required: true 
    },
    
  },
  { timestamps: true },
);

export type UserDocument = InferSchemaType<typeof userSchema>;
export const UserModel = model("User", userSchema);
