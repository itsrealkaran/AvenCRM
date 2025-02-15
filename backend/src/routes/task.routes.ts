import { Router } from "express";
import { protect } from "../middleware/auth.js";
import { Request, Response } from "express";
import db from "../db/index.js";
import { TaskPriority, TaskStatus } from "@prisma/client";
import logger from "../utils/logger.js";
import { notificationService } from "../services/redis.js";

const router: Router = Router();
router.use(protect);

// Get all tasks
router.get("/", async (req: Request, res: Response) => {
  try {
    const tasks = await db.task.findMany({
      where: {
        userId: req.user?.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    res.json(tasks);
  } catch (error) {
    logger.error("Get tasks error:", error);
    res.status(500).json({ message: "Failed to fetch tasks" });
  }
});

// Create task
router.post("/", async (req: Request, res: Response) => {
  const {
    title,
    description,
    priority,
    status,
    dueDate,
    colorTag,
    tags,
    category,
  } = req.body;

  const user = req.user;
  if (!user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const task = await db.task.create({
      data: {
        title,
        description,
        priority: priority || TaskPriority.MEDIUM,
        status: status || TaskStatus.TODO,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        colorTag,
        tags: tags || [],
        category,
        userId: user.id,
      },
    });

    const link =
      user.role === "ADMIN"
        ? "/admin/tasks"
        : user.role === "TEAM_LEADER"
        ? "/teamleader/tasks"
        : user.role === "AGENT"
        ? "/agent/tasks"
        : user.role === "SUPERADMIN"
        ? "/superadmin/tasks"
        : "";

    try {
      await notificationService.createNotification(user.id, {
        title: "New task",
        message: `${title}`,
        type: "task",
        link,
      });
    } catch (error) {
      console.log("Error creating notification:", error);
    }

    res.json(task);
  } catch (error) {
    logger.error("Create task error:", error);
    res.status(500).json({ message: "Failed to create task" });
  }
});

// Update task
router.put("/:id", async (req: Request, res: Response) => {
  const {
    title,
    description,
    priority,
    status,
    dueDate,
    colorTag,
    tags,
    category,
  } = req.body;
  const taskId = req.params.id;

  try {
    // Verify task ownership
    const existingTask = await db.task.findFirst({
      where: {
        id: taskId,
        userId: req.user?.id,
      },
    });

    if (!existingTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    const task = await db.task.update({
      where: { id: taskId },
      data: {
        title,
        description,
        priority,
        status,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        colorTag,
        tags: tags || [],
        category,
      },
    });
    res.json(task);
  } catch (error) {
    logger.error("Update task error:", error);
    res.status(500).json({ message: "Failed to update task" });
  }
});

// Delete task
router.delete("/:id", async (req: Request, res: Response) => {
  const taskId = req.params.id;

  try {
    // Verify task ownership
    const existingTask = await db.task.findFirst({
      where: {
        id: taskId,
        userId: req.user?.id,
      },
    });

    if (!existingTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    await db.task.delete({
      where: { id: taskId },
    });
    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    logger.error("Delete task error:", error);
    res.status(500).json({ message: "Failed to delete task" });
  }
});

// Bulk delete tasks
router.delete("/", async (req: Request, res: Response) => {
  const { taskIds } = req.body;

  if (!Array.isArray(taskIds) || taskIds.length === 0) {
    return res.status(400).json({ message: "Invalid task IDs" });
  }

  try {
    // Verify task ownership for all tasks
    const tasks = await db.task.findMany({
      where: {
        id: { in: taskIds },
        userId: req.user?.id,
      },
    });

    if (tasks.length !== taskIds.length) {
      return res
        .status(403)
        .json({ message: "Some tasks not found or unauthorized" });
    }

    await db.task.deleteMany({
      where: {
        id: { in: taskIds },
        userId: req.user?.id,
      },
    });
    res.json({ message: "Tasks deleted successfully" });
  } catch (error) {
    logger.error("Bulk delete tasks error:", error);
    res.status(500).json({ message: "Failed to delete tasks" });
  }
});

export default router;
