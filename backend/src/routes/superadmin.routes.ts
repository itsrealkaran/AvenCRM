import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { protect } from "../middleware/auth.js";

const router: Router = Router();
router.use(protect);

router.get("/", async (req, res) => {
  const role = req.user?.role;
  if (role !== "SUPERADMIN") {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const superAdmins = await prisma.superAdmin.findMany();
    res.json(superAdmins);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch super admins" });
  }
});

router.get("/:id", async (req, res) => {
  const role = req.user?.role;
  if (role !== "SUPERADMIN") {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const superAdmin = await prisma.superAdmin.findUnique({
      where: { id: req.params.id },
    });
    res.json(superAdmin);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch super admin" });
  }
});

router.post("/", async (req, res) => {
  const role = req.user?.role;
  if (role !== "SUPERADMIN") {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const data = {
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
  };

  try {
    const superAdmin = await prisma.superAdmin.create({
      data: data,
    });
    res.json(superAdmin);
  } catch (error) {
    res.status(500).json({ message: "Failed to create super admin" });
  }
});

router.put("/:id", async (req, res) => {
  const role = req.user?.role;
  if (role !== "SUPERADMIN") {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const data = {
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
  };
  try {
    const superAdmin = await prisma.superAdmin.update({
      where: { id: req.params.id },
      data: data,
    });
    res.json(superAdmin);
  } catch (error) {
    res.status(500).json({ message: "Failed to update super admin" });
  }
});

router.delete("/:id", async (req, res) => {
  const role = req.user?.role;
  if (role !== "SUPERADMIN") {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const superAdmin = await prisma.superAdmin.delete({
      where: { id: req.params.id },
    });
    res.json(superAdmin);
  } catch (error) {
    res.status(500).json({ message: "Failed to delete super admin" });
  }
});

export default router;
