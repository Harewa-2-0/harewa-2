import mongoose from "mongoose";
import type { YardBundle } from "@/lib/fabricCommerce";

/**
 * Fabric catalog entries. Sellable fabrics use fixed 4- or 6-yard bundles (see bundlePrice).
 * Fabrics are not part of the customization checkout flow.
 */
export interface IFabric extends mongoose.Document {
    name: string;
    image: string;
    type: string;
    color: string;
    pattern?: string;
    weight?: number;
    width?: number;
    composition?: string;
    supplier?: string;
    /** @deprecated Use bundlePrice + yardBundle for sales */
    pricePerMeter?: number;
    inStock?: boolean;
    /** 4 or 6 yards per purchasable bundle */
    yardBundle?: YardBundle;
    /** Price for one bundle (yardBundle yards) */
    bundlePrice?: number;
    /** Inventory counted in whole bundles */
    stockBundles?: number;
    /** When true, fabric can be added to cart (requires yardBundle + bundlePrice) */
    isSellable?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

const FabricSchema = new mongoose.Schema<IFabric>(
    {
        name: { type: String, required: true },
        image: { type: String, required: true },
        type: { type: String, required: true },
        color: { type: String, required: true },
        pattern: { type: String },
        weight: { type: Number },
        width: { type: Number },
        composition: { type: String },
        supplier: { type: String },
        pricePerMeter: { type: Number },
        inStock: { type: Boolean, default: true },
        yardBundle: { type: Number, enum: [4, 6] },
        bundlePrice: { type: Number, min: 0 },
        stockBundles: { type: Number, min: 0, default: 0 },
        isSellable: { type: Boolean, default: false },
    },
    { timestamps: true }
);

export const Fabric = mongoose.models.Fabric || mongoose.model<IFabric>("Fabric", FabricSchema);
