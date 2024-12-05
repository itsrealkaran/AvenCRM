import { Router } from "express"
import db from "../../db"

const router = Router();

router.get("/subscriptions", async(req, res) => {
    try {
        const { companyId } = req.body;

        const payments = await db.payment.findMany({
            where: {
                companyId
            }
        })
        res.send(payments);
        
    } catch (err) {
        res.status(500).json(err);
    }
})

export { router as manageSubscription }