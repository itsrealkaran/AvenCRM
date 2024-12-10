import { Router } from "express";
import db from "../db/index.js";
import { authenticateToken } from "../middleware/authMiddleware.js";
import { protect } from "../middleware/auth.js";

const router = Router();
router.use(protect)

router.get("/getEvents", async (req, res) => {
  try {
    if (!req.user) {
      res.status(400).json({ message: "bad auth" });
    } else {
      //@ts-ignore
      let id = req.user.profileId;

      const events = await db.calendarEvent.findMany({
        where: {
          setterId: id,
        },
      });
      res.send(events);
    }
  } catch (err) {
    console.log(err);
  }
});

router.post("/createEvent", async (req, res) => {
  try {
    const { title, description, startTime, endTime, type } =
      req.body;
    if (!req.user) {
      res.status(400).json({ message: "bad auth" });
    } else {
      //@ts-ignore
      let id = req.user.profileId;

      const startTimeTime = new Date(startTime);
      const endTimeTime = new Date(endTime);
      const event = await db.calendarEvent.create({
        data: {
          title,
          description,
          startTime: startTimeTime,
          endTime: endTimeTime,
          type,
          setterId: id,
        },
      });

      res.send(event);
    }
  } catch (err) {
    console.log(err);
  }
});

export { router as manageCalendar };
