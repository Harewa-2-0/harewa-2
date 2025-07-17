// models/Wallet.js
import mongoose from "mongoose";
import { unique } from "next/dist/build/utils";

export interface IWallet extends mongoose.Document {
  user: mongoose.Types.ObjectId;
  balance: number;
  transactions: {
    type: 'credit' | 'debit';
    amount: number;
    description: string;
  }[];
  createdAt?: Date;
  updatedAt?: Date;
}

const walletSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    unique: true,
    required: true,
  },
  balance: {
    type: Number,
    default: 0,
  },
  transactions: [
    {
      type: {
        type: String,
        enum: ['credit', 'debit'],
        required: true,
      },
      amount: {
        type: Number,
        required: true,
      },
      description: String,
      reference: {
        type: String, required: true, unique: true,

      },
      date: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export const Wallet = mongoose.models.Wallet || mongoose.model('Wallet', walletSchema);
