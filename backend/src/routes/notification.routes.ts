import { Router } from "express";
import { protect } from "../middleware/auth.js";
import NotificationController from "../controllers/notification.controller.js";

const router:Router = Router();

router.use(protect);

router.get("/", NotificationController.getAllNotifications);

router.get("/count", NotificationController.getNotificationsCount)

router.post("/read/:id", NotificationController.markNotificationAsRead)

router.put("/mark-all-read", NotificationController.markAllRead)

router.delete("/all", NotificationController.deleteAllNotifications)

export { router as notificationRoutes }