// src/services/customization.ts
import { api, unwrap, type MaybeWrapped, ApiError } from "@/utils/api";

/** ---------- Types ---------- */
export type CustomizationInput = {
  outfit: "gown" | "skirt" | "blouse" | "pants" | "sleeve";  // Must match backend enum
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
  outfit: "gown" | "skirt" | "blouse" | "pants" | "sleeve";  // Must match backend enum
  outfitOption: string;
  fabricType: string;
  size: string;
  preferredColor: string;
  additionalNotes: string;
  productId?: string;
  user?: string | {
    _id: string;
    name?: string;
    email?: string;
  };
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
 * Get all customizations for current user (user-facing)
 */
export async function getCurrentUserCustomizations(): Promise<CustomizationResponse[]> {
  try {
    const response = await api<MaybeWrapped<CustomizationResponse[]>>("/api/customization/me");
    const data = unwrap(response);
    
    return Array.isArray(data) ? data : [];
  } catch (error) {
    // Handle 404 as empty result (no customizations found)
    if (error instanceof ApiError && error.status === 404) {
      return [];
    }
    
    console.error("Failed to get user customizations:", error);
    throw error;
  }
}

/**
 * Get all customizations (admin only)
 * Fetches all customization requests with populated user data
 */
export async function getAllCustomizations(): Promise<CustomizationResponse[]> {
  try {
    const response = await api<MaybeWrapped<CustomizationResponse[]>>("/api/customization");
    const data = unwrap(response);
    
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Failed to get all customizations:", error);
    throw error;
  }
}

/**
 * Get all customizations for a specific user by ID (admin only)
 * Fetches all customization requests from a specific user
 */
export async function getUserCustomizationsById(userId: string): Promise<CustomizationResponse[]> {
  try {
    const response = await api<MaybeWrapped<CustomizationResponse[]>>(`/api/customization/user/${userId}`);
    const data = unwrap(response);
    
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Failed to get user customizations by ID:", error);
    throw error;
  }
}

/**
 * Update an existing customization request
 * Updates a customization with new data via PUT request
 */
export async function updateCustomization(id: string, input: Partial<CustomizationInput>): Promise<CustomizationResponse> {
  try {
    const response = await api<MaybeWrapped<CustomizationResponse>>(`/api/customization/${id}`, {
      method: "PUT",
      body: JSON.stringify(input),
    });

    // Handle both wrapped and unwrapped responses
    const data = unwrap(response);
    
    if (!data) {
      throw new Error("Invalid response format");
    }

    return data;
  } catch (error) {
    console.error("Failed to update customization:", error);
    throw error;
  }
}
