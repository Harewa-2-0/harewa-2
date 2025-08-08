"use client";

import { useEffect } from "react";

export default function GoogleOAuthCallback() {
  useEffect(() => {
    // Only run if opened as a popup:
    if (window.opener && !window.opener.closed) {
      // Tell the opener we succeeded:
      window.opener.postMessage(
        { type: "GOOGLE_AUTH_SUCCESS" },
        window.location.origin
      );
      // Then close this popup:
      window.close();
    }
  }, []);

  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h1>Signing you in…</h1>
      <p>If this window doesn’t close automatically, you can close it manually.</p>
    </div>
  );
}
