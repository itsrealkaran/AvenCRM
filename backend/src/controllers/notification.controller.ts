import { Request, Response } from "express";
import { notificationService } from "../services/redis.js";

const NotificationController = {
    getAllNotifications: async (req: Request, res: Response) => {
        try {
            const user = req.user;
            if (!user) {
                return res.status(401).json({ message: "Unauthorized" });
            }

            const userNotifications = await notificationService.getUserNotifications(user.id);

            return res.json(userNotifications);
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: "Failed to get notifications" });
        }
    },

    deleteAllNotifications: async (req: Request, res: Response) => {
        try {
            const user = req.user;
            if (!user) {
                return res.status(401).json({ message: "Unauthorized" });
            }

            await notificationService.clearAllNotifications(user.id);
            return res.json({ message: "Notifications deleted" });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: "Failed to delete notifications" });
        }
    },

    getNotificationsCount: async (req: Request, res: Response) => {
        try {
            const user = req.user;
            if (!user) {
                return res.status(401).json({ message: "Unauthorized" });
            }

            const count = await notificationService.getUnreadCount(user.id);
            return res.json( count );
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: "Failed to delete notifications" });
        }
    },

    markNotificationAsRead: async (req: Request, res: Response) => {
        try {
            const user = req.user;
            if (!user) {
                return res.status(401).json({ message: "Unauthorized" });
            }
            const { id } = req.params;
            if (!id) {
                return res.status(400).json({ message: "Invalid notification id" });
            }

            await notificationService.markNotificationAsRead(user.id, id);
            return res.json({ message: "Notifications marked as read" });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: "Failed to mark notifications as read" });
        }
    }
};

export default NotificationController;