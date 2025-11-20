import mongoose from "mongoose";

const ActivityLogSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Users", // 👈 refers to your existing User model
            required: false, // optional — sometimes actions may be system-triggered
        },
        action: {
            type: String,
            required: true, // e.g., "Created Order", "Updated Profile"
        },
        entityType: {
            type: String,
            enum: ["Order", "Product", "User", "Profile", "System", "Other"],
            default: "System",
        },
        entityId: {
            type: mongoose.Schema.Types.ObjectId,
            required: false,
        },
        description: {
            type: String,
            maxlength: 500,
        },
        ipAddress: {
            type: String,
        },
        metadata: {
            type: Object, // flexible for extra details (e.g., { orderId: "..." })
            default: {},
        },
    },
    {
        timestamps: true, // adds createdAt and updatedAt
    }
);

// Index for faster admin analytics queries
ActivityLogSchema.index({ createdAt: -1 });

export const ActivityLog =
    mongoose.models.ActivityLog || mongoose.model("ActivityLog", ActivityLogSchema);
