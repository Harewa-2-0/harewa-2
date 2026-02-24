// src/services/fashionChat.ts
import { api, unwrap, type MaybeWrapped } from "@/utils/api";

/** ---------- Types ---------- */
export type FashionChatInput = {
    messages: ChatMessage[];
    image?: string; // base64 string
};

export type ChatMessage = {
    _id?: string;
    id?: string;
    role: "user" | "assistant";
    content: string;
    image?: string;
    timestamp?: string;
    createdAt?: string;
};

export type SendMessageResponse = {
    message: string;
    chat?: any;
    handoffRequired?: boolean;
    reply: ChatMessage;
};

export type ChatHistoryResponse = ChatMessage[];

/** ---------- API Functions ---------- */

/**
 * Send a fashion consultation request to the AI
 */
export async function sendFashionConsultation(input: FashionChatInput): Promise<SendMessageResponse> {
    try {
        const response = await api<MaybeWrapped<SendMessageResponse>>("/api/fashion-chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(input),
            credentials: "include",
        });

        const data = unwrap<SendMessageResponse>(response);

        if (!data) {
            throw new Error("Invalid response format");
        }

        return data;
    } catch (error) {
        console.error("Failed to send fashion consultation:", error);
        throw error;
    }
}

/**
 * Get chat history for the current user
 */
export async function getChatHistory(): Promise<ChatHistoryResponse> {
    try {
        const response = await api<MaybeWrapped<ChatHistoryResponse>>("/api/fashion-chat", {
            method: "GET",
            credentials: "include",
        });

        const data = unwrap<ChatHistoryResponse>(response);

        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error("Failed to get chat history:", error);
        // Return empty array on error instead of throwing
        return [];
    }
}
