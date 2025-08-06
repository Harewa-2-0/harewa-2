// components/common/Toast.tsx
"use client";
import { ToastType } from "@/hooks/use-toast";

export default function Toast({
  toast,
  onClose,
}: {
  toast: ToastType;
  onClose: () => void;
}) {
  return (
    <div
      className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
        toast.type === "success"
          ? "bg-green-500"
          : toast.type === "error"
          ? "bg-red-500"
          : "bg-blue-500"
      } text-white`}
    >
      <div className="flex items-center justify-between">
        <span>{toast.message}</span>
        <button
          onClick={onClose}
          className="ml-2 text-white hover:text-gray-200"
        >
          ×
        </button>
      </div>
    </div>
  );
}
