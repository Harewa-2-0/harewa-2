import mongoose from "mongoose";

const shopSchema = new mongoose.Schema({
  shopLogo: { type: String },
  shopName: {
    type: String,
    required: true,
    unique: true,
  },
  username: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  phone: {
    type: String,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Virtual populate to link products to each shop
shopSchema.virtual('products', {
  ref: 'Product',
  localField: '_id',
  foreignField: 'shop',
});

shopSchema.set('toObject', { virtuals: true });
shopSchema.set('toJSON', { virtuals: true });

export const Shop = mongoose.models.Shop || mongoose.model('Shop', shopSchema);
