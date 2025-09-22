"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useToast } from "@/contexts/toast-context";

export default function useSignupHandlers() {
  const router = useRouter();
  const { setEmailForVerification } = useAuthStore();
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    rememberMe: false,
    role: "user", // Default to user, can be toggled to "admin"
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

  const handleRoleToggle = () => {
    setFormData((prev) => ({
      ...prev,
      role: prev.role === "user" ? "admin" : "user",
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
          role: formData.role,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Signup failed");

      setEmailForVerification(formData.email);
      
      // Store the role for verification page
      localStorage.setItem('signupRole', formData.role);
      
      const successMessage = formData.role === "admin" 
        ? "Admin account created! Verification code sent to admin email for approval."
        : "Signup Successful! Please check your email.";
      
      addToast(successMessage, "success");
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
    handleRoleToggle,
    handleSubmit,
    isLoading,
    addToast,
    showUserExistsModal,
    setShowUserExistsModal,
  };
}
