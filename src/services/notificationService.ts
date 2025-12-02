import { Types } from "mongoose";
import { Notification } from "@/lib/models/Notification";
import { getIO } from "@/lib/socketServer";

/**
 * Notification Type Enum
 */
export type NotificationType = "order" | "system" | "promo" | "alert";

/**
 * Notification Metadata Type
 */
export interface NotificationMetadata {
    [key: string]: unknown;
}

/**
 * Create a notification and emit it in real time.
 *
 * @param userId - MongoDB ObjectId of the user receiving the notification
 * @param title - Notification title
 * @param message - Notification message content
 * @param type - Notification type ('order' | 'system' | 'promo' | 'alert')
 * @param metadata - Optional additional data about the event
 * @returns The created notification document
 */
export async function createNotification(
    userId: Types.ObjectId,
    title: string,
    message: string,
    type: NotificationType = "system",
    metadata: NotificationMetadata = {}
) {
    const notification = await Notification.create({
        user: userId,
        title,
        message,
        type,
        metadata,
    });

    try {
        const io = getIO();
        io.to(userId.toString()).emit("new-notification", notification);
    } catch (err) {
        console.warn("Socket.IO not initialized:", err);
    }

    return notification;
}
