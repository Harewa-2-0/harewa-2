// models/CustomRequest.ts
import mongoose from "mongoose";

const statusHistorySchema = new mongoose.Schema(
    {
        status: {
            type: String,
            enum: ["pending", "in-progress", "completed", "cancelled"],
            required: true
        },
        note: {
            type: String
        },
        updatedAt: {
            type: Date,
            default: Date.now
        }
    },
    { _id: false }
);

const customRequestSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        gender: {
            type: String,
            enum: ["male", "female", "unisex"],
            required: true
        },
        style: {
            type: String,
            required: true
        },
        eventType: {
            type: String,
            required: true
        },
        fitType: {
            type: String,
            required: true
        },
        color: {
            type: String,
            required: true
        },
        budget: {
            type: Number,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        image: {
            type: String,
            required: true
        },
        status: {
            type: String,
            enum: ["pending", "in-progress", "completed", "cancelled"],
            default: "pending"
        },
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        history: [statusHistorySchema]
    },
    { timestamps: true }
);

export const CustomRequest =
    mongoose.models.CustomRequest || mongoose.model("CustomRequest", customRequestSchema);
