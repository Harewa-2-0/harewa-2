import mongoose, { Document } from "mongoose";

export interface IOrder extends mongoose.Document {
  user: mongoose.Types.ObjectId;
  carts: mongoose.Types.ObjectId;
  amount: number;
  status: 'pending' | 'initiated' | 'paid' | 'shipped' | 'shipping' | 'delivered' | 'cancelled';
  walletId: mongoose.Types.ObjectId;
  address: string;
  createdAt: Date;
  updatedAt: Date;
}

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  carts: { type: mongoose.Schema.Types.ObjectId, ref: 'Cart', required: true },
  amount: { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending', 'initiated', 'paid', 'shipped', 'shipping', 'delivered', 'cancelled'],
    default: 'pending'
  },
  walletId: { type: mongoose.Schema.Types.ObjectId, ref: 'Wallet', required: true },
  address: { type: String, required: true }
}, { timestamps: true });

export const Order = mongoose.models.Order || mongoose.model<IOrder>("Order", orderSchema);
