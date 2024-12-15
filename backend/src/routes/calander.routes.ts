import { Router } from "express";
import db from "../db/index.js";
import { protect } from "../middleware/auth.js";

const router: Router = Router();
router.use(protect)

router.get("/getEvents", async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      res.status(400).json({ message: "bad auth" });
    } else {
      let id = req.user.id;

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

router.put("/update/:id", async (req, res) => {
  try {
    const { title, description, start, end } = req.body;
    const eventId = req.params.id
    
    if (!req.user || !req.user.id) {
      return res.status(400).json({ message: "bad auth" });
    }
    
    const setterId = req.user.id;

    // Ensure proper date conversion and validation
    if (!start || !end) {
      return res.status(400).json({ message: "Start time and end time are required" });
    }

    const startTimeDate = new Date(start);
    const endTimeDate = new Date(end);

    // Validate dates are valid
    if (isNaN(startTimeDate.getTime()) || isNaN(endTimeDate.getTime())) {
      return res.status(400).json({ message: "Invalid date format" });
    }

    const event = await db.calendarEvent.update({
      where: {
        id: eventId,  // Use the parsed eventId
        setterId     // Ensure the event belongs to the user
      },
      data: {
        title,
        description,
        start: startTimeDate,
        end: endTimeDate
      },
    });

    res.status(200).send(event);
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});

router.post("/createEvent", async (req, res) => {
  try {
    const { title, description, start, end } =
      req.body;
      console.log(req.body);
    if (!req.user || !req.user.id) {
      return res.status(400).json({ message: "bad auth" });
    } else {
      const id = req.user.id;

      // Ensure proper date conversion and validation
      if (!start || !end) {
        return res.status(400).json({ message: "Start time and end time are required" });
      }

      const startTimeDate = new Date(start);
      const endTimeDate = new Date(end);

      // Validate dates are valid
      if (isNaN(startTimeDate.getTime()) || isNaN(endTimeDate.getTime())) {
        return res.status(400).json({ message: "Invalid date format" });
      }

      const event = await db.calendarEvent.create({
        data: {
          title,
          description,
          start: startTimeDate,
          end: endTimeDate,
          setterId: id,
        },
      });

      res.status(201).send(event);
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

router.delete("/delete/:id", async (req, res) => {
  try {
    const eventId = req.params.id
    if (!req.user || !req.user.id) {
      res.status(400).json({ message: "bad auth" });
    } else {
      let id = req.user.id;

      const events = await db.calendarEvent.delete({
        where: {
          setterId: id,
          id: eventId
        },
      });
      res.send(events);
    }
  } catch (err) {
    console.log(err);
  }
});

export { router as manageCalendar };
