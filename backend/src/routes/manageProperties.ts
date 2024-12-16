import { Router } from "express";
import db from "../db/index.js"

const router: Router = Router()

router.get("/getAll", async(req, res) => {
    try {
        const properties = await db.property.findMany();

        res.send(properties);
    } catch (err) {
        res.status(500).json(err);
    }
})

router.post("/addProperty", (req, res) => {
    try {
        const { agentId } = req.body;

        
    } catch (err) {
        res.status(500).json(err);
    }
})

export { router as getProperties };