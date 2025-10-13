'use client';

import { api, json, type MaybeWrapped, unwrap } from '@/utils/api';

/** Payment purchase endpoint payload */
export type PurchaseType = 'gateway' | 'wallet';

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

/**
 * Initiate a purchase. The backend decides the provider based on `type`.
 * Body: { type: 'gateway' | 'wallet', orderId }
 */
export async function purchase(payload: PurchaseRequest): Promise<PurchaseResponse> {
  if (!payload?.orderId || !payload.orderId.trim()) {
    throw new Error('purchase: `orderId` is required.');
  }
  if (payload.type !== 'gateway' && payload.type !== 'wallet') {
    throw new Error("purchase: `type` must be 'gateway' or 'wallet'.");
  }

  const raw = await api<MaybeWrapped<PurchaseResponse>>(BASE, json({
    type: payload.type,
    orderId: payload.orderId.trim(),
  }));

  return unwrap<PurchaseResponse>(raw);
}

/**
 * Extract a redirect URL from various possible response shapes.
 */
export function getRedirectUrl(resp: PurchaseResponse | null | undefined): string | null {
  if (!resp) return null;
  return (
    resp.redirectUrl ||
    resp.authorization_url ||
    resp.data?.redirectUrl ||
    (resp.data as any)?.authorization_url ||
    // Paystack response structure: data.data.authorization_url
    (resp.data as any)?.data?.authorization_url ||
    null
  );
}

