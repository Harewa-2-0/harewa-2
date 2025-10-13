// src/services/customization.ts
import { api, unwrap, type MaybeWrapped } from "@/utils/api";

/** ---------- Types ---------- */
export type CustomizationInput = {
  outfit: string;              // e.g., "sleeve gown"
  outfitOption: string;        // e.g., "Long sleeve with slit"
  fabricType: string;          // e.g., "Ankara"
  size: string;                // e.g., "M"
  preferredColor: string;      // e.g., "Red and Gold"
  additionalNotes: string;     // user's custom notes
  productId?: string;          // optional: link to product
};

export type CustomizationResponse = {
  _id?: string;
  id?: string;
  outfit: string;
  outfitOption: string;
  fabricType: string;
  size: string;
  preferredColor: string;
  additionalNotes: string;
  productId?: string;
  createdAt?: string;
  updatedAt?: string;
};

/** ---------- API Functions ---------- */

/**
 * Create a new customization request
 */
export async function createCustomization(input: CustomizationInput): Promise<CustomizationResponse> {
  try {
    const response = await api<MaybeWrapped<CustomizationResponse>>("/api/customization", {
      method: "POST",
      body: JSON.stringify(input),
    });

    // Handle both wrapped and unwrapped responses
    const data = unwrap(response);
    
    if (!data) {
      throw new Error("Invalid response format");
    }

    return data;
  } catch (error) {
    console.error("Failed to create customization:", error);
    throw error;
  }
}

/**
 * Get customization by ID (if needed for future features)
 */
export async function getCustomization(id: string): Promise<CustomizationResponse> {
  try {
    const response = await api<MaybeWrapped<CustomizationResponse>>(`/api/customization/${id}`);
    const data = unwrap(response);
    
    if (!data) {
      throw new Error("Customization not found");
    }

    return data;
  } catch (error) {
    console.error("Failed to get customization:", error);
    throw error;
  }
}

/**
 * Get all customizations for a user (if needed for future features)
 */
export async function getUserCustomizations(): Promise<CustomizationResponse[]> {
  try {
    const response = await api<MaybeWrapped<CustomizationResponse[]>>("/api/customization/me");
    const data = unwrap(response);
    
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Failed to get user customizations:", error);
    throw error;
  }
}
