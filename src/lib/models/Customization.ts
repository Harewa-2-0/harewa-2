import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICustomization extends Document {
    user: mongoose.Types.ObjectId;
    outfit: string;
    outfitOption?: string;
    fabricType: string;
    size: string;
    preferredColor: string;
    additionalNotes?: string;
    productId?: string;
    referenceImage?: string[];
    fabricImage?: string;
    selections?: {
        outfit: string;
        option: string;
    }[];
    createdAt: Date;
}

const CustomizationSchema = new Schema<ICustomization>(
    {
        user: { type: Schema.Types.ObjectId, ref: "User", required: true },
        outfit: {
            type: String,
            required: true,
        },
        outfitOption: { type: String },
        fabricType: { type: String, required: true },
        size: { type: String, required: true },
        preferredColor: { type: String, required: true },
        additionalNotes: { type: String },
        productId: { type: String },
        referenceImage: [{ type: String }],
        fabricImage: { type: String },
        selections: [
            {
                outfit: { type: String },
                option: { type: String },
            },
        ],
    },
    { timestamps: { createdAt: true, updatedAt: false } }
);

// lib/models/Customization.ts
if (mongoose.models.Customization) {
    delete (mongoose.models as any).Customization;
}

export const Customization: Model<ICustomization> =
    mongoose.model<ICustomization>("Customization", CustomizationSchema);
