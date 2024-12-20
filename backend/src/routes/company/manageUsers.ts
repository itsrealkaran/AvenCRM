import { Router } from "express";
import db from "../../db/index.js";
import { authenticateToken } from "../../middleware/authMiddleware.js";
import { verifyAdmin } from "../../lib/verifyUser.js";

const router: Router = Router();

router.get("/getAll", authenticateToken, async (req, res) => {
  if (!req.user) {
    res.status(400).json({ message: "bad auth" });
  } else {
    //@ts-ignore
    const adminId = req.user.id;
    const isVerified = await verifyAdmin(adminId);
    if (!isVerified) {
      res.status(400).json({ err: "not verified" });
      return;
    }
    const agents = await db.company.findFirst({
      where: {
        adminId,
      },
    });
    if (!isVerified) {
      res.status(400).json({ err: "not verified" });
    }
    try {
      const agents = await db.company.findFirst({
        where: {
          adminId,
        },
        include: {
          users: true,
        },
      });

      res.status(200).send(agents?.users);
    } catch (err) {
      res.send(err);
    }
  }
});

router.post("/add", authenticateToken, async (req, res) => {
  const { name, dob, gender, phoneNo, email, role } = req.body;
  if (!req.user) {
    res.status(400).json({ message: "bad auth" });
  } else {
    //@ts-ignore
    const adminId = req.user.id;
    try {
      const company = await db.company.findFirst({
        where: {
          adminId,
        },
      });
      if (!company) {
        res.status(404).json({ message: "heckerrrrr" });
      } else {
        const agent = await db.agent.create({
          data: {
            name,
            email,
            password: "testpassword",
            phone: phoneNo,
            dob,
            gender,
            role,
            companyId: company.id,
          },
        });

        res.status(201).send(agent);
      }
    } catch (err) {
      res.send(err);
    }
  }
});

router.patch("/update", authenticateToken, async (req, res) => {
  const { name, age, gender, phoneNo, email, role, agentId } =
    req.body;

  if (!req.user) {
    res.status(400).json({ message: "bad auth" });
  } else {
    try {
      //@ts-ignore
      const adminId = req.user.id;
      const isVerified = await verifyAdmin(adminId);
      if (!isVerified) {
        res.status(400).json({ err: "not verified" });
      } else {

        const agent = await db.agent.update({
          where: {
            id: agentId,
          },
          data: {
            name,
            email,
            password: "testpassword",
            phone: phoneNo,
            dob: age,
            gender,
            role,
          },
        });

        res.status(201).send(agent);
      }
    } catch (err) {
      res.send(err);
    }
  }
});

router.delete("/delete", authenticateToken, async (req, res) => {
  const { agentId } = req.body;
  if (!req.user) {
    res.status(400).json({ message: "bad auth" });
  } else {
    //@ts-ignore
    const adminId = req.user.id;
    const isVerified = await verifyAdmin(adminId);
    if (!isVerified) {
      res.status(400).json({ err: "not verified" });
    }

    const company = await db.company.findFirst({
      where: {
        adminId,
      },
    });
    if (!company) {
      res.status(404).json({ message: "heckerrrrr" });
    } else {
      const companyId = company.id;
      try {
        const agents = await db.agent.delete({
          where: {
            id: agentId,
            companyId: companyId,
          },
        });

        res.status(200).send(agents);
      } catch (err) {
        res.send(err);
      }
    }
  }
});

export { router as agentRouter };
