import { Router } from 'express';
import db from '../../db';
import { authenticateToken } from '../../middleware/authMiddleware';

const router = Router();

router.get('/getAll', authenticateToken, async (req, res) => {
  if (!req.user) {
    res.status(400).json({ message: "bad auth" });
  } else {
    //@ts-ignore
    const adminId = req.user.profileId
  
    try {
      const agents = await db.company.findFirst({
        where: {
          adminId
        },
        include: {
          users: true
        }
      });
  
      res.status(200).send(agents?.users);
    } catch (err) {
      res.send(err);
    }
  }
});

router.post('/add', async (req, res) => {
  const { name, dob, gender, phoneNo, email, role, companyId } = req.body;

  try {
    const agent = await db.agent.create({
      data: {
        name,
        email,
        password: 'testpassword',
        phone: phoneNo,
        dob,
        gender,
        role,
        companyId,
      },
    });

    res.status(201).send(agent);
  } catch (err) {
    res.send(err);
  }
});

router.patch('/update', async (req, res) => {
  const { name, age, gender, phoneNo, email, role, agentId, companyId } =
    req.body;

  try {
    const agent = await db.agent.update({
      where: {
        id: agentId,
        companyId
      },
      data: {
        name,
        email,
        password: 'testpassword',
        phone: phoneNo,
        dob: age,
        gender,
        role,
        companyId,
      },
    });

    res.status(201).send(agent);
  } catch (err) {
    res.send(err);
  }
});

router.delete('/delete', async (req, res) => {
  const { companyId, agentId } = req.body;

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
});

export { router as agentRouter };
