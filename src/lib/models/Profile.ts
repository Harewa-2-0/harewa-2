import mongoose from "mongoose";

const ProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
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
  address: { type: String },

});

export const Profile =
  mongoose.models.Profile || mongoose.model("Profile", ProfileSchema);
