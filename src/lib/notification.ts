import moment from "moment";
import { NextRequest } from "next/server";
import { Notification } from "../lib/models/Notification";
import { ok, badRequest, serverError } from "@/lib/response";
import connectDB from "@/lib/db";
import { requireAuth } from "@/lib/middleware/requireAuth";

// Types
// interface NotificationData {
//   content: string;
//   creator_id: string;
//   creator: string;
//   createdAt: Date;
// }

interface FormattedNotification {
  _id: string;
  content: string;
  creator_id: string;
  creator: string;
  createdAt: string;
  updatedAt?: string;
  __v?: number;
}

// Create notification utility function
export const createNotification = async (
  content: string,
  creator_id: string,
  createdAt?: Date
): Promise<void> => {
  try {
    await connectDB();

    await Notification.create({
      content,
      creator_id,
      creator: creator_id,
      createdAt: createdAt || new Date(),
    });
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
};

// Get all notifications for a user - Next.js API route handler
export const getUserNotification = async (request: NextRequest) => {
  try {
    await connectDB();

    const user = requireAuth(request);
    const userId = user.sub;

    const notifications = await Notification.find({
      creator_id: userId,
    }).sort({ _id: -1 });

    const formattedNotifications: FormattedNotification[] = notifications.map((notification) => ({
      ...notification._doc,
      createdAt: moment(notification.createdAt).format(),
    }));

    return ok({
      success: true,
      message: "Notifications retrieved successfully",
      data: formattedNotifications,
    });
  } catch (error: unknown) {
    console.error("Error getting user notifications:", error);
    return serverError("Failed to retrieve notifications: " + error);
  }
};

// Alternative: Get notifications with pagination
export const getUserNotificationsPaginated = async (
  request: NextRequest,
  page: number = 1,
  limit: number = 10
) => {
  try {
    await connectDB();

    const user = requireAuth(request);
    const userId = user.sub;

    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      Notification.find({
        creator_id: userId,
      })
        .sort({ _id: -1 })
        .skip(skip)
        .limit(limit),
      Notification.countDocuments({
        creator_id: userId,
      }),
    ]);

    const formattedNotifications: FormattedNotification[] = notifications.map((notification) => ({
      ...notification._doc,
      createdAt: moment(notification.createdAt).format(),
    }));

    return ok({
      success: true,
      message: "Notifications retrieved successfully",
      data: {
        notifications: formattedNotifications,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error: unknown) {
    console.error("Error getting user notifications:", error);
    return serverError("Failed to retrieve notifications: " + error);
  }
};

// Mark notification as read
export const markNotificationAsRead = async (
  request: NextRequest,
  notificationId: string
) => {
  try {
    await connectDB();

    const user = requireAuth(request);
    const userId = user.sub;

    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, creator_id: userId },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return badRequest("Notification not found");
    }

    return ok({
      success: true,
      message: "Notification marked as read",
      data: notification,
    });
  } catch (error: unknown) {
    console.error("Error marking notification as read:", error);
    return serverError("Failed to mark notification as read: " + error);
  }
};

// Delete notification
export const deleteNotification = async (
  request: NextRequest,
  notificationId: string
) => {
  try {
    await connectDB();

    const user = requireAuth(request);
    const userId = user.sub;

    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      creator_id: userId,
    });

    if (!notification) {
      return badRequest("Notification not found");
    }

    return ok({
      success: true,
      message: "Notification deleted successfully",
      data: null,
    });
  } catch (error: unknown) {
    console.error("Error deleting notification:", error);
    return serverError("Failed to delete notification: " + error);
  }
};

// Get unread notifications count
export const getUnreadNotificationsCount = async (request: NextRequest) => {
  try {
    await connectDB();

    const user = requireAuth(request);
    const userId = user.sub;

    const count = await Notification.countDocuments({
      creator_id: userId,
      isRead: { $ne: true },
    });

    return ok({
      success: true,
      message: "Unread notifications count retrieved successfully",
      data: { count },
    });
  } catch (error: unknown) {
    console.error("Error getting unread notifications count:", error);
    return serverError("Failed to get unread notifications count: " + error);
  }
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async (request: NextRequest) => {
  try {
    await connectDB();

    const user = requireAuth(request);
    const userId = user.sub;

    const result = await Notification.updateMany(
      { creator_id: userId, isRead: { $ne: true } },
      { isRead: true }
    );

    return ok({
      success: true,
      message: "All notifications marked as read",
      data: { modifiedCount: result.modifiedCount },
    });
  } catch (error: unknown) {
    console.error("Error marking all notifications as read:", error);
    return serverError("Failed to mark all notifications as read: " + error);
  }
};

// Bulk create notifications (for system-wide notifications)
export const bulkCreateNotifications = async (
  content: string,
  userIds: string[],
  createdAt?: Date
): Promise<void> => {
  try {
    await connectDB();

    const notifications = userIds.map((userId) => ({
      content,
      creator_id: userId,
      creator: userId,
      createdAt: createdAt || new Date(),
    }));

    await Notification.insertMany(notifications);
  } catch (error) {
    console.error("Error bulk creating notifications:", error);
    throw error;
  }
};