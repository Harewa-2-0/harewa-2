// models/FashionChat.ts
import mongoose from "mongoose";

const fashionChatSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: false, // allow guest users
        },
        messages: [
            {
                role: { type: String, enum: ["user", "assistant"], required: true },
                content: { type: String, required: true },
            },
        ],
        context: {
            bodyType: String,
            occasion: String,
            preferences: [String],
            colorPreferences: [String],
            season: String,
            requirements: String,
        },
        recommendations: mongoose.Schema.Types.Mixed, // AI output (styles, products, etc.)
    },
    { timestamps: true }
);

export const FashionChat =
    mongoose.models.FashionChat || mongoose.model("FashionChat", fashionChatSchema);
