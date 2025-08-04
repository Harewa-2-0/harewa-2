import mongoose from "mongoose";

const ProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    required: true,
  },
  profilePicture: {
    type: String,
  },
  bio: {
    type: String,
    maxlength: 500,
  },
  firstName: { type: String },
  lastName: { type: String },

  addresses: [
    {
      line1: { type: String, required: true },
      line2: { type: String },
      city: { type: String },
      state: { type: String },
      zip: { type: String },
      country: { type: String },
      isDefault: { type: Boolean, default: false },
    }
  ],
});

export const Profile =
  mongoose.models.Profile || mongoose.model("Profile", ProfileSchema);
