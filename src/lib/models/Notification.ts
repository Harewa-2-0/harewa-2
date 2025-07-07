import mongoose from "mongoose";
import { currentTime } from "../utils";

const notificationSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      default: "",
    },
    creator_id: {
      type: String,
      default: "",
    },
    creator_photo_url: {
      type: String,
      default: "",
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    createdAt: {
      type: Date,
      default: currentTime(Date.now()),
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
  }
);

// notificationSchema.pre(/^find/, function (next) {
//   this.populate({
//     path: "creator",
//     select:
//       "-__v -password -email -phoneNumber -createdAt -updatedAt -isReported -accountDeleted -isBlocked -isVerified -role -category -dial_code -country -otp -otpExpires -emailVerify",
//   });
//   next();
// });

export const Notification = mongoose.models.Notification || mongoose.model("Notification", notificationSchema);
