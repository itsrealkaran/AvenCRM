import { Router } from "express";
import db from "../db"

const router = Router()

router.get("/getTransaction", async(req, res) => {
    try {
        const transactions = await db.transaction.findMany();

        res.send(transactions);
    } catch (err) {
        res.status(500).json(err);
    }
})

export { router as transactions }