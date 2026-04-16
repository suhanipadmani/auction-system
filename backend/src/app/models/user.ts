import { Schema, model } from "mongoose";
import bcrypt from "bcrypt";
import { USER_ROLES, USER_STATUSES } from "../enums";

export const userSchema = new Schema(
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
      enum: Object.values(USER_ROLES), 
      default: USER_ROLES.BIDDER, 
      required: true 
    },
    
    status: { 
      type: String, 
      enum: Object.values(USER_STATUSES), 
      default: USER_STATUSES.ACTIVE, 
      required: true 
    },
    
  },
  { timestamps: true },
);

// Hash password before saving
userSchema.pre("save", async function () {
  const user = this as any;
  if (!user.isModified("password")) return;

  try {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
  } catch (error: any) {
    throw error;
  }
});

// Instance method to compare password
userSchema.methods.comparePassword = async function (password: string) {
  return bcrypt.compare(password, this.password);
};

import { IUserDocument } from "../types/models";

export const UserModel = model<IUserDocument>("User", userSchema);
export { USER_ROLES };

