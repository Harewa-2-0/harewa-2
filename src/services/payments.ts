'use client';

import { api, json, type MaybeWrapped, unwrap } from '@/utils/api';

/** Payment purchase endpoint payload */
export type PurchaseType = 'stripe-gateway' | 'paystack-gateway' | 'wallet';

export interface PurchaseRequest {
  type: PurchaseType;
  orderId: string;
}

/** Common shapes we may receive from backend gateways */
export interface PurchaseResponse {
  success?: boolean;
  message?: string;
  // Generic redirect targets that various integrations may use
  redirectUrl?: string;
  authorization_url?: string;
  data?: {
    redirectUrl?: string;
    authorization_url?: string;
    [k: string]: unknown;
  } & Record<string, unknown>;
  [k: string]: unknown;
}

const BASE = '/api/payment/purchase';
const TIMEOUT_MS = 30000; // 30 seconds timeout

/**
 * Create a promise that rejects after a specified timeout
 */
function timeoutPromise<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Request timed out. Please try again.')), ms)
    ),
  ]);
}

/**
 * Initiate a purchase. The backend decides the provider based on `type`.
 * Body: { type: 'stripe-gateway' | 'paystack-gateway' | 'wallet', orderId }
 */
export async function purchase(payload: PurchaseRequest): Promise<PurchaseResponse> {
  if (!payload?.orderId || !payload.orderId.trim()) {
    throw new Error('purchase: `orderId` is required.');
  }
  if (payload.type !== 'stripe-gateway' && payload.type !== 'paystack-gateway' && payload.type !== 'wallet') {
    throw new Error("purchase: `type` must be 'stripe-gateway', 'paystack-gateway', or 'wallet'.");
  }

  try {
    const apiCall = api<MaybeWrapped<PurchaseResponse>>(BASE, json({
      type: payload.type,
      orderId: payload.orderId.trim(),
    }));

    const raw = await timeoutPromise(apiCall, TIMEOUT_MS);
    return unwrap<PurchaseResponse>(raw);
  } catch (error: any) {
    // Enhance error messages
    if (error.message === 'Request timed out. Please try again.') {
      throw new Error('Payment initialization timed out. This might be due to server issues. Please try again.');
    }

    // Handle network errors
    if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
      throw new Error('Network error. Please check your connection and try again.');
    }

    // Pass through other errors with original message
    throw error;
  }
}

/**
 * Extract a redirect URL from various possible response shapes.
 */
export function getRedirectUrl(resp: PurchaseResponse | null | undefined): string | null {
  if (!resp) return null;

  return (
    // Direct URL on response (Stripe checkout session already unwrapped)
    (resp as any).url ||
    resp.redirectUrl ||
    resp.authorization_url ||
    resp.data?.redirectUrl ||
    resp.data?.url ||
    // Triple-nested Stripe response: data.data.data.url
    (resp.data as any)?.data?.data?.url ||
    // Double-nested Stripe response: data.data.url
    (resp.data as any)?.data?.url ||
    (resp.data as any)?.authorization_url ||
    // Paystack response structure: data.data.authorization_url
    (resp.data as any)?.data?.authorization_url ||
    null
  );
}