import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  carts: { type: mongoose.Schema.Types.ObjectId, ref: 'Cart', required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'paid', 'shipped', 'delivered'], default: 'pending' },
  walletId: { type: mongoose.Schema.Types.ObjectId, ref: 'Wallet', required: true },
  address: { type: String, required: true }
}, { timestamps: true });

export const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);
