import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICustomization extends Document {
    user: mongoose.Types.ObjectId;
    outfit: "sleeve" | "gown" | "skirt" | "blouse" | "pants";
    outfitOption?: string;
    fabricType: string;
    size: string;
    preferredColor: string;
    additionalNotes?: string;
    createdAt: Date;
}

const CustomizationSchema = new Schema<ICustomization>(
    {
        user: { type: Schema.Types.ObjectId, ref: "User", required: true },
        outfit: {
            type: String,
            enum: ["sleeve", "gown", "skirt", "blouse", "pants"],
            required: true,
        },
        outfitOption: { type: String },
        fabricType: { type: String, required: true },
        size: { type: String, required: true },
        preferredColor: { type: String, required: true },
        additionalNotes: { type: String },
    },
    { timestamps: { createdAt: true, updatedAt: false } }
);

export const Customization: Model<ICustomization> =
    mongoose.models.Customization ||
    mongoose.model<ICustomization>("Customization", CustomizationSchema);
