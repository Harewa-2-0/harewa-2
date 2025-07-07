import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String },
  username: { type: String, unique: true },
  phoneNumber: { type: String, unique: true },
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

export const User = mongoose.models.User || mongoose.model("User", UserSchema);
