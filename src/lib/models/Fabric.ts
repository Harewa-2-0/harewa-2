import mongoose from "mongoose";

export interface IFabric extends mongoose.Document {
    name: string;
    type: string;
    color: string;
    pattern?: string;
    weight?: number;
    width?: number;
    composition?: string;
    supplier?: string;
    pricePerMeter?: number;
    inStock?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

const FabricSchema = new mongoose.Schema<IFabric>(
    {
        name: { type: String, required: true },
        type: { type: String, required: true },
        color: { type: String, required: true },
        pattern: { type: String },
        weight: { type: Number },
        width: { type: Number },
        composition: { type: String },
        supplier: { type: String },
        pricePerMeter: { type: Number },
        inStock: { type: Boolean, default: true },
    },
    { timestamps: true }
);

export const Fabric = mongoose.models.Fabric || mongoose.model<IFabric>("Fabric", FabricSchema);