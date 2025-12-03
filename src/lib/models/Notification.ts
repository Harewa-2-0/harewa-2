import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ["order", "system", "promo", "alert"],
      default: "system",
    },
    read: { type: Boolean, default: false },
    metadata: { type: Object }, // optional additional info
  },
  { timestamps: true }
);

export const Notification =
  mongoose.models.Notification || mongoose.model("Notification", NotificationSchema);
