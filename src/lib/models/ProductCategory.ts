import { Schema, model } from "mongoose";
import mongoose from "mongoose";

export interface ProductCategory {
    id: string;
    name: string;
    description?: string;
    createdAt: Date;
    updatedAt: Date;
}


export const ProductCategorySchema = new Schema<ProductCategory>({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: { type: String },
    createdAt: { type: Date, required: true, default: Date.now },
    updatedAt: { type: Date, required: true, default: Date.now },
});

export const ProductCategory =
    mongoose.models.ProductCategory || model("ProductCategory", ProductCategorySchema);
