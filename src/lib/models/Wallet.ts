// models/Wallet.ts
import mongoose from "mongoose";
import crypto from "crypto";

export interface IWallet extends mongoose.Document {
  user: mongoose.Schema.Types.ObjectId;
  balance: number;
  transactions?: {
    type: 'credit' | 'debit';
    amount: number;
    description?: string;
    reference: string;
    status?: 'pending' | 'failed' | 'success';
    date?: Date;
  }[];
  beneficiary?: {
    name: string;
    accountNumber: string;
    bank: string;
    accountType: string;
  }[];
  createdAt?: Date;
  updatedAt?: Date;
}

const transactionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['credit', 'debit'],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
  },
  reference: {
    type: String,
    required: true,
    default: () => `txn-${crypto.randomBytes(8).toString('hex')}`,
    index: true,
  },
  status: {
    type: String,
    enum: ['pending', 'failed', 'success'],
    default: 'pending',
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

const walletSchema = new mongoose.Schema(
  {
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
    // Only validate if a transaction object exists
    transactions: {
      type: [transactionSchema],
      default: [],
      validate: {
        validator: function (val: []) {
          // allow empty array
          return Array.isArray(val);
        },
        message: 'Transactions must be an array',
      },
    },
    beneficiary: [
      {
        name: String,
        accountNumber: String,
        bank: String,
        accountType: String,
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
  },
  { timestamps: true }
);

export const Wallet =
  mongoose.models.Wallets || mongoose.model<IWallet>('Wallets', walletSchema);
