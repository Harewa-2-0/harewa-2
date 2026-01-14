import mongoose from "mongoose";
import { v4 as uuidv4 } from 'uuid';

const UserSchema = new mongoose.Schema({
  uuid: {
    type: String, required: true, unique: true, default: uuidv4,
  },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  username: { type: String, unique: true },
  firstName: { type: String },
  lastName: { type: String },
  phoneNumber: { type: String, },
  isVerified: { type: Boolean, default: false },
  accountDeleted: { type: Boolean, default: false },
  verificationCode: { type: String },
  refreshTokenJTI: { type: String, default: null },
  googleId: { type: String, unique: true, sparse: true },
  role: {
    type: String, enum: ["admin", "seller", "client"], default: "client"
  },
  joinedAt: { type: Date, default: Date.now },
});
UserSchema.virtual("profile", {
  ref: "Profile", // 👈 must match the model name string in mongoose.model("Profile", ...)
  localField: "_id",
  foreignField: "user",
  justOne: true, // because one user = one profile
});

// Enable virtuals in outputs
UserSchema.set("toObject", { virtuals: true });
UserSchema.set("toJSON", { virtuals: true });

export const User = mongoose.models.Users || mongoose.model("Users", UserSchema);
