// hooks/useToast.ts
"use client";
import { useState } from "react";

export interface ToastType {
  id: number;
  message: string;
  type: "info" | "success" | "error";
}

export default function useToast() {
  const [toasts, setToasts] = useState<ToastType[]>([]);

  const addToast = (message: string, type: ToastType["type"] = "info") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  return { toasts, setToasts, addToast };
}
