/** Safe post-login redirect — blocks open redirects and role mismatches. */
export function sanitizeAuthReturnTo(
  returnTo: string | null | undefined,
  role: string
): string | null {
  if (!returnTo || !returnTo.startsWith("/") || returnTo.startsWith("//")) {
    return null;
  }
  if (role === "admin") {
    return returnTo.startsWith("/admin") ? returnTo : null;
  }
  return returnTo.startsWith("/admin") ? null : returnTo;
}

export function buildAdminOrderPath(orderId: string): string {
  return `/admin/orders/${orderId}`;
}
