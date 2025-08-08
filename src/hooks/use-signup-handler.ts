"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import useToast from "./use-toast";

export default function useSignupHandlers() {
  const router = useRouter();
  const { setEmailForVerification } = useAuthStore();
  const { toasts, setToasts, addToast } = useToast();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    rememberMe: false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showUserExistsModal, setShowUserExistsModal] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          fullName: formData.fullName,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Signup failed");

      setEmailForVerification(formData.email);
      addToast("Signup Successful! Please check your email.", "success");
      router.push("/verify-email");
    } catch (err: any) {
      if (err.message?.toLowerCase().includes("exist")) {
        setShowUserExistsModal(true);
      } else {
        addToast("Signup Failed: " + (err.message || "Something went wrong."), "error");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    formData,
    handleInputChange,
    handleSubmit,
    isLoading,
    toasts,
    setToasts,
    addToast,
    showUserExistsModal,
    setShowUserExistsModal,
  };
}
