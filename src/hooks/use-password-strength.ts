"use client";

import { useState, useEffect } from "react";

export interface PasswordRequirement {
  id: string;
  text: string;
  test: (password: string) => boolean;
  met: boolean;
}

export default function usePasswordStrength(password: string) {
  const [requirements, setRequirements] = useState<PasswordRequirement[]>([
    { id: "length", text: "minimum of 8 characters", test: (pwd) => pwd.length >= 8, met: false },
    { id: "uppercase", text: "one uppercase letter", test: (pwd) => /[A-Z]/.test(pwd), met: false },
    { id: "lowercase", text: "one lowercase letter", test: (pwd) => /[a-z]/.test(pwd), met: false },
    { id: "number", text: "one number", test: (pwd) => /\d/.test(pwd), met: false },
    { id: "symbol", text: "one symbol", test: (pwd) => /[!@#$%^&*(),.?":{}|<>]/.test(pwd), met: false },
  ]);

  const [strength, setStrength] = useState<"empty" | "weak" | "medium" | "strong">("empty");
  const [showRequirements, setShowRequirements] = useState(true);

  useEffect(() => {
    if (!password) {
      setStrength("empty");
      setRequirements((prev) => prev.map((r) => ({ ...r, met: false })));
      setShowRequirements(true);
      return;
    }

    const updated = requirements.map((req) => ({
      ...req,
      met: req.test(password),
    }));

    setRequirements(updated);

    const metCount = updated.filter((req) => req.met).length;
    setStrength(metCount <= 2 ? "weak" : metCount <= 4 ? "medium" : "strong");

    if (metCount === 5) {
      setTimeout(() => setShowRequirements(false), 1500);
    }
  }, [password]);

  /** ✅ Moved from original component */
  const getStrengthText = (level: typeof strength) => {
    switch (level) {
      case "weak":
        return "Too Weak";
      case "medium":
        return "Almost there";
      case "strong":
        return "Great!";
      default:
        return "";
    }
  };

  const getStrengthBarWidth = (level: typeof strength) => {
    switch (level) {
      case "weak":
        return "w-1/4";
      case "medium":
        return "w-3/5";
      case "strong":
        return "w-full";
      default:
        return "w-0";
    }
  };

  const getStrengthBarColor = (level: typeof strength) => {
    switch (level) {
      case "weak":
        return "bg-red-500";
      case "medium":
        return "bg-yellow-500";
      case "strong":
        return "bg-green-500";
      default:
        return "bg-gray-300";
    }
  };

  return {
    requirements,
    strength,
    showRequirements,
    setShowRequirements,
    getStrengthText,
    getStrengthBarWidth,
    getStrengthBarColor,
  };
}
