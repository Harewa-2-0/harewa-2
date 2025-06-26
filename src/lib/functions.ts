export const formatDateTime = (iso: string) => {
  const date = new Date(iso);
  return (
    date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }) +
    ", " +
    date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
  );
};

export async function logoutUser() {
  try {
    const res = await fetch("/api/auth/logout", {
      method: "POST",
    });

    if (res.ok) {
      // Optionally: clear client state or redirect
      window.location.href = "/login"; // or use router.push("/login") in Next.js
    } else {
      console.error("Failed to logout");
    }
  } catch (err) {
    console.error("Logout error:", err);
  }
}

