# Payment Flow - Complete Implementation

## Overview

Complete Stripe payment flow with verification and proper success/failure handling.

---

## Complete User Flow

### 1. Checkout Page → Payment Initiation

**User Action:** Clicks Stripe logo → Clicks "PAY WITH STRIPE"

**Frontend:** `payment-method-selector.tsx`
```typescript
const resp = await purchase({ 
  type: 'stripe-gateway', 
  orderId: currentOrder._id 
});
const redirect = getRedirectUrl(resp);
window.location.href = redirect; // Redirect to Stripe
```

**Backend:** `POST /api/payment/purchase`
```json
Request: {
  "type": "stripe-gateway",
  "orderId": "xxx"
}

Response: {
  "success": true,
  "data": {
    "url": "https://checkout.stripe.com/c/pay/cs_xxx..."
  }
}
```

---

### 2. Stripe Checkout Page

**User Action:** Completes payment on Stripe's hosted page

**Stripe handles:**
- Card input
- Payment processing
- 3D Secure authentication
- Security & PCI compliance

---

### 3A. Payment Success Flow

**Stripe redirects to:**
```
/payment/success?session_id=cs_test_xxx...
```

**Frontend:** `src/app/(public)/payment/success/page.tsx`

**What happens:**
```typescript
1. Page loads → Shows "Verifying Payment" spinner
2. Extracts session_id from URL
3. Calls: GET /api/payment/stripe/confirm?session_id=xxx
4. Backend verifies with Stripe
5. If verified:
   - clearCurrentOrder() (remove from frontend state)
   - fetchAllOrders() (refresh order list)
   - Show success message
   - Button: "VIEW MY ORDERS"
6. If failed:
   - Show error
   - Redirect to /payment/failure after 3s
```

**Backend:** `GET /api/payment/stripe/confirm`
```typescript
1. Retrieves session from Stripe API
2. Checks: session.payment_status === "paid"
3. Finds order by orderId (from metadata)
4. Updates order.status = "paid"
5. Handles wallet funds (add then deduct)
6. Returns: { success: true }
```

---

### 3B. Payment Cancel Flow

**Stripe redirects to:**
```
/payment/cancel
```

**Frontend:** `src/app/(public)/payment/cancel/page.tsx`

**What happens:**
```typescript
1. Shows "Payment Cancelled" message
2. Explains: Order is still pending
3. Button: "RETURN TO CHECKOUT"
4. User can retry payment
```

**No backend call needed** - Order stays in "initiated" status

---

### 3C. Payment Failure Flow

**If verification fails:**
```
/payment/failure?reference=xxx
```

**Frontend:** `src/app/(public)/payment/failure/page.tsx`

**What happens:**
```typescript
1. Shows "Payment Failed" message
2. Explains possible reasons
3. Button: "TRY AGAIN" → /checkout
4. Support contact info
```

---

## Files Modified (Frontend Only)

### 1. Payment Service
**File:** `src/services/payments.ts`
- Updated types: `'stripe-gateway' | 'paystack-gateway' | 'wallet'`
- Updated validation logic
- API call sends new format

### 2. Payment Method Selector
**File:** `src/components/Public_C/checkout/payment-method-selector.tsx`
- Paystack: COMMENTED OUT
- Stripe: ENABLED
- Button: "PAY WITH STRIPE"
- API call: `type: 'stripe-gateway'`

### 3. Manual Card Input
**File:** `src/components/Public_C/checkout/payment-methods.tsx`
- ENTIRELY COMMENTED OUT
- Not needed for gateway redirects

### 4. Success Page (UPDATED)
**File:** `src/app/(public)/payment/success/page.tsx`
- Now calls `/api/payment/stripe/confirm` to verify
- Shows verification spinner
- Clears order from frontend state
- Refreshes order list
- Three states: verifying, success, failed

### 5. Cancel Page (NEW)
**File:** `src/app/(public)/payment/cancel/page.tsx`
- New page for cancelled payments
- Shows yellow warning icon
- Explains order is still pending
- Button to return to checkout

### 6. Failure Page (Existing)
**File:** `src/app/(public)/payment/failure/page.tsx`
- Already exists (no changes needed)
- Shows error state
- Button to retry

---

## Backend Endpoints (Already Exist)

### Purchase Endpoint
```
POST /api/payment/purchase
```
**Request:**
```json
{
  "type": "stripe-gateway",
  "orderId": "xxx"
}
```
**Response:**
```json
{
  "success": true,
  "data": {
    "url": "https://checkout.stripe.com/...",
    "id": "cs_xxx"
  }
}
```

### Confirmation Endpoint
```
GET /api/payment/stripe/confirm?session_id=xxx
```
**What it does:**
1. Retrieves session from Stripe
2. Verifies payment_status === "paid"
3. Updates order.status = "paid"
4. Handles wallet transactions

**Response:**
```json
{
  "success": true,
  "message": "Order processed successfully",
  "data": { ...order }
}
```

---

## Payment Status Lifecycle

```
1. Order Created
   status: "pending"
   
2. User clicks "PAY WITH STRIPE"
   status: "initiated" (backend sets this)
   
3. User completes payment on Stripe
   Stripe payment_status: "paid"
   
4. Success page calls confirm endpoint
   Backend verifies → status: "paid"
   
5. User sees success message
   Order is complete ✅
```

---

## Error Handling

### No session_id in URL
- Shows failed state
- Redirects to /checkout after 3s

### Verification API fails
- Shows failed state
- Redirects to /payment/failure after 3s

### User cancels on Stripe
- Stripe redirects to /payment/cancel
- Shows cancel message
- Order stays "initiated"
- User can retry

---

## Environment Variables Needed

**Backend needs:**
```env
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

**Frontend needs:**
```env
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

---

## Testing Checklist

### Success Flow
- [ ] Click "PAY WITH STRIPE" → Redirects to Stripe
- [ ] Complete payment → Redirects to /payment/success
- [ ] See "Verifying Payment" spinner
- [ ] API calls /api/payment/stripe/confirm
- [ ] See "Payment Successful" message
- [ ] Order status updated to "paid" in database
- [ ] Click "VIEW MY ORDERS" → /orders page
- [ ] Order shows as paid in order list

### Cancel Flow
- [ ] Click "PAY WITH STRIPE" → Redirects to Stripe
- [ ] Click "Back" or cancel → Redirects to /payment/cancel
- [ ] See "Payment Cancelled" message
- [ ] Order status still "initiated" (not paid)
- [ ] Click "RETURN TO CHECKOUT" → /checkout page
- [ ] Can retry payment

### Failure Flow
- [ ] Payment fails verification
- [ ] Redirects to /payment/failure
- [ ] See "Payment Failed" message
- [ ] Click "TRY AGAIN" → /checkout page

---

## Summary

✅ **Frontend changes only** - No backend modifications needed
✅ **Success page now verifies** payment with Stripe
✅ **Cancel page created** for cancelled payments
✅ **Proper state management** - clears orders, refreshes lists
✅ **Three clear paths:** Success, Cancel, Failure
✅ **No linter errors**

**Ready to test once backend dev adds Stripe keys!** 🎉

