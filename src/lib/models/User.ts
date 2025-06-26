import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  username: { type: String, unique: true },
  phoneNumber: { type: String, unique: true },
  isVerified: { type: Boolean, default: false },
  verificationCode: { type: String },
  refreshTokenJTI: { type: String, default: null },
  role: { type: String, enum: ["admin", "client"], default: "admin" },
  joinedAt: { type: Date, default: Date.now },
});

export const User = mongoose.models.User || mongoose.model("User", UserSchema);
