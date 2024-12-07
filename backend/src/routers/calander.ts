import { Router } from "express";
import db from "../db";
import { authenticateToken } from "../middleware/authMiddleware";

const router = Router();

router.get("/getEvents", authenticateToken, async (req, res) => {
  try {
    console.log(req.user);
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

router.post("/createEvent", authenticateToken, async (req, res) => {
  try {
    const { title, description, startTime, endTime, location, type, setterId } =
      req.body;
    const startTimeTime = new Date(startTime);
    const endTimeTime = new Date(endTime);
    const event = await db.calendarEvent.create({
      data: {
        title,
        description,
        startTime: startTimeTime,
        endTime: endTimeTime,
        type,
        setterId,
      },
    });

    res.send(event);
  } catch (err) {
    console.log(err);
  }
});

export { router as manageCalendar };
