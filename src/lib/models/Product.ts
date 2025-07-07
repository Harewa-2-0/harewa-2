import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  remainingInStock: { type: Number, default: 0 },
  location: { type: String, required: true },
  images: { type: [String], validate: [arrayLimit, '{PATH} exceeds the limit of 3'] },
  sizes: {
    type: [String],
    enum: ['small', 'medium', 'large', 'extra-large'],
    default: []
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'non-binary'],
    required: true
  },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'ProductCategory', required: true },
  fabricType: { type: mongoose.Schema.Types.ObjectId, ref: 'Fabric', required: true },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  shop: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true }

}, { timestamps: true });

function arrayLimit(val: string) {
  return val.length <= 3;
}

export const Product = mongoose.models.Product || mongoose.model("Product", productSchema);
