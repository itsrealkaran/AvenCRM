import { Router } from "express";
import db from "../db"

const router = Router();

router.get("/getEvents", async(req, res) => {
    try {
        let id = "";
        if(req.body.agentId) {
            id = req.body.agentId;
        } else if (req.body.adminId) {
            id = req.body.adminId;
        } else if (req.body.superAdminId) {
            id = req.body.superAdminId
        } else {
            res.status(400).json({ message: "bad auth" })
        }
        const events = await db.calendarEvent.findMany({
            where: {
                setterId: id
            }
        })
        res.send(events);
    } catch (err) {
        res.status(500).json(err);
    }
})

router.post("createEvent", async(req, res) => {
    try {
        const { title, description, startTime, endTime, location, type, setterId } = req.body;

        const event = await db.calendarEvent.create({
            data: {
                title,
                description,
                startTime,
                endTime,
                type,
                location,
                setterId
            }
        })

        res.send(event);
    } catch (err) {
        res.status(500).json(err);
    }
})

export { router as manageCalendar }