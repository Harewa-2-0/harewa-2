import mongoose from "mongoose";

const aiSettingsSchema = new mongoose.Schema(
    {
        botName: {
            type: String,
            default: "Harewa AI",
            required: true,
        },
        usePublicData: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

export const AiSettings =
    mongoose.models.AiSettings || mongoose.model("AiSettings", aiSettingsSchema);
