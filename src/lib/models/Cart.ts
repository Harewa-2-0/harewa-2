import mongoose from "mongoose";

const cartLineSchema = new mongoose.Schema(
  {
    lineType: {
      type: String,
      enum: ["product", "fabric"],
      required: true,
    },
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    fabric: { type: mongoose.Schema.Types.ObjectId, ref: "Fabric" },
    quantity: { type: Number, required: true, min: 1 },
    productNote: [{ type: String }],
    /** Snapshot at add-to-cart time (fabric lines) */
    bundlePrice: { type: Number },
    yardBundle: { type: Number, enum: [4, 6] },
  },
  { _id: true }
);

const cartSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    lines: [cartLineSchema],
    /** @deprecated Synced from product lines for backward compatibility */
    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: { type: Number, required: true },
        productNote: [{ type: String }],
      },
    ],
  },
  { timestamps: true }
);

export const Cart = mongoose.models.Cart || mongoose.model("Cart", cartSchema);
