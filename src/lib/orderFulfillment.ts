/**
 * Order totals, validation, payment payloads, and inventory on paid orders.
 */

import mongoose from "mongoose";
import { Cart } from "@/lib/models/Cart";
import { Fabric } from "@/lib/models/Fabric";
import { Product } from "@/lib/models/Product";
import { Order } from "@/lib/models/Order";
import {
  calcFabricLineTotal,
  assertFabricStock,
  assertSellableFabric,
} from "@/lib/fabricCommerce";
import {
  getCartPopulateOptions,
  migrateCartToLines,
} from "@/lib/cartLines";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type CartLike = Record<string, any>;

export function getOrderCartPopulateConfig() {
  return {
    path: "carts",
    populate: getCartPopulateOptions(),
  };
}

export async function loadCartForCheckout(cartId: string) {
  const cart = await Cart.findById(cartId).populate(getCartPopulateOptions());
  if (!cart) {
    throw new Error("Cart not found");
  }
  migrateCartToLines(cart);
  return cart;
}

export function getCartLines(cart: CartLike): CartLike[] {
  migrateCartToLines(cart);
  return cart.lines ?? [];
}

export function getCartItemCount(cart: CartLike): number {
  return getCartLines(cart).length;
}

export function assertCartNotEmpty(cart: CartLike): void {
  if (getCartItemCount(cart) === 0) {
    throw new Error("Cart is empty");
  }
}

export function calculateCartTotal(cart: CartLike): number {
  const lines = getCartLines(cart);
  return lines.reduce((sum, line) => sum + calculateLineSubtotal(line), 0);
}

export function calculateLineSubtotal(line: CartLike): number {
  const qty = Math.max(1, Math.floor(Number(line.quantity) || 1));

  if (line.lineType === "fabric") {
    const bundlePrice =
      Number(line.bundlePrice) ||
      Number(
        typeof line.fabric === "object" && line.fabric
          ? line.fabric.bundlePrice
          : 0
      );
    return calcFabricLineTotal(bundlePrice, qty);
  }

  const product =
    typeof line.product === "object" && line.product ? line.product : null;
  const price = Number(product?.price ?? 0);
  return price * qty;
}

export async function validateCartForOrder(cart: CartLike): Promise<void> {
  assertCartNotEmpty(cart);
  const lines = getCartLines(cart);

  const fabricIds = new Set<string>();
  const productIds = new Set<string>();
  const checks: Array<
    | { kind: "fabric"; id: string; qty: number }
    | { kind: "product"; id: string; qty: number }
  > = [];

  for (const line of lines) {
    const qty = Math.max(1, Math.floor(Number(line.quantity) || 1));

    if (line.lineType === "fabric") {
      const fabricId = line.fabric?._id ?? line.fabric;
      if (!fabricId) {
        throw new Error("Invalid fabric line in cart");
      }
      const id = String(fabricId);
      fabricIds.add(id);
      checks.push({ kind: "fabric", id, qty });
      continue;
    }

    const productId = line.product?._id ?? line.product;
    if (!productId) {
      throw new Error("Invalid product line in cart");
    }
    const id = String(productId);
    productIds.add(id);
    checks.push({ kind: "product", id, qty });
  }

  const [fabrics, products] = await Promise.all([
    fabricIds.size > 0
      ? Fabric.find({ _id: { $in: [...fabricIds] } }).lean()
      : Promise.resolve([]),
    productIds.size > 0
      ? Product.find({ _id: { $in: [...productIds] } }).lean()
      : Promise.resolve([]),
  ]);

  const fabricMap = new Map(fabrics.map((f) => [String(f._id), f]));
  const productMap = new Map(products.map((p) => [String(p._id), p]));

  for (const check of checks) {
    if (check.kind === "fabric") {
      assertFabricStock(fabricMap.get(check.id), check.qty);
      continue;
    }

    const product = productMap.get(check.id);
    if (!product) {
      throw new Error("Product not found");
    }
    const stock = product.remainingInStock;
    if (typeof stock === "number" && stock >= 0 && check.qty > stock) {
      throw new Error(
        `Only ${stock} unit(s) available for "${product.name}"`
      );
    }
  }
}

export type PaymentLineItem =
  | {
      lineType: "fabric";
      fabricId: string;
      name: string;
      yardBundle: number;
      bundlePrice: number;
      quantity: number;
      lineTotal: number;
    }
  | {
      lineType: "product";
      productId: string;
      name: string;
      price: number;
      quantity: number;
      productNote?: string[];
      lineTotal: number;
    };

export function buildPaymentLineItems(cart: CartLike): PaymentLineItem[] {
  return getCartLines(cart).map((line) => {
    const qty = Math.max(1, Math.floor(Number(line.quantity) || 1));
    const lineTotal = calculateLineSubtotal(line);

    if (line.lineType === "fabric") {
      const fabric =
        typeof line.fabric === "object" && line.fabric ? line.fabric : null;
      const fabricId = String(fabric?._id ?? line.fabric ?? "");
      const yardBundle = Number(line.yardBundle ?? fabric?.yardBundle ?? 0);
      const bundlePrice = Number(line.bundlePrice ?? fabric?.bundlePrice ?? 0);
      return {
        lineType: "fabric",
        fabricId,
        name: fabric?.name ?? "Fabric",
        yardBundle,
        bundlePrice,
        quantity: qty,
        lineTotal,
      };
    }

    const product =
      typeof line.product === "object" && line.product ? line.product : null;
    return {
      lineType: "product",
      productId: String(product?._id ?? line.product ?? ""),
      name: product?.name ?? "Product",
      price: Number(product?.price ?? 0),
      quantity: qty,
      productNote: line.productNote,
      lineTotal,
    };
  });
}

export async function decrementInventoryForCart(cart: CartLike): Promise<void> {
  const lines = getCartLines(cart);

  for (const line of lines) {
    const qty = Math.max(1, Math.floor(Number(line.quantity) || 1));

    if (line.lineType === "fabric") {
      const fabricId = line.fabric?._id ?? line.fabric;
      const fabric = await Fabric.findById(fabricId);
      if (!fabric) continue;

      if (typeof fabric.stockBundles === "number") {
        fabric.stockBundles = Math.max(0, fabric.stockBundles - qty);
        if (fabric.stockBundles === 0) {
          fabric.inStock = false;
        }
      }
      await fabric.save();
      continue;
    }

    const productId = line.product?._id ?? line.product;
    const product = await Product.findById(productId);
    if (!product) continue;

    if (typeof product.remainingInStock === "number") {
      product.remainingInStock = Math.max(0, product.remainingInStock - qty);
      await product.save();
    }
  }
}

export async function createFreshCartForUser(
  userId: mongoose.Types.ObjectId | string
) {
  return Cart.create({
    user: userId,
    lines: [],
    products: [],
  });
}

/**
 * After order is marked paid: validate stock, decrement inventory, new empty cart.
 * Call only once per order (when transitioning to paid).
 */
export async function completeOrderFulfillment(
  orderId: string,
  userId: mongoose.Types.ObjectId | string
): Promise<void> {
  const order = await Order.findById(orderId);
  if (!order) {
    throw new Error("Order not found");
  }

  const cart = await loadCartForCheckout(String(order.carts));
  await validateCartForOrder(cart);
  await decrementInventoryForCart(cart);
  await createFreshCartForUser(userId);
}

/** Re-validate sellable fabric lines before payment (e.g. gateway init). */
export async function refreshFabricLineSnapshots(cart: CartLike): Promise<void> {
  migrateCartToLines(cart);
  const fabricLines = getCartLines(cart).filter((line) => line.lineType === "fabric");
  if (fabricLines.length === 0) return;

  const fabricIds = [
    ...new Set(
      fabricLines.map((line) => String(line.fabric?._id ?? line.fabric ?? ""))
    ),
  ].filter(Boolean);

  const fabrics = await Fabric.find({ _id: { $in: fabricIds } }).lean();
  const fabricMap = new Map(fabrics.map((f) => [String(f._id), f]));

  for (const line of fabricLines) {
    const fabricId = String(line.fabric?._id ?? line.fabric ?? "");
    const fabric = fabricMap.get(fabricId);
    assertSellableFabric(fabric);
    line.bundlePrice = fabric!.bundlePrice;
    line.yardBundle = fabric!.yardBundle;
  }

  if (typeof cart.markModified === "function") {
    cart.markModified("lines");
    await cart.save();
  }
}
