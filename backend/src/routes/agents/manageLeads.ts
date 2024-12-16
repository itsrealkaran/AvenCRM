import { Router } from 'express';
import db from '../../db/index.js';
import { authenticateToken } from '../../middleware/authMiddleware.js';

const router: Router = Router();

//managing leads

router.get('/getall', authenticateToken, async (req, res) => {
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
        include: {
          leads: true
        }
      })
      if(!company){
        res.status(404).json({ message: "heckerrrrr" });
      } else {
        res.status(200).send(company.leads);
      }
    } catch (err) {
      res.send(err);
    }
  }
});
router.post('/add', async (req, res) => {
  const {
    name,
    status,
    phoneNo,
    email,
    companyId,
    agentId,
    leadAmount,
    source,
    expectedDate,
    notes,
  } = req.body;
  const datedate = expectedDate ? new Date(expectedDate) : null;
  try {
    const lead = await db.lead.create({
      data: {
        companyId,
        agentId,
        name,
        status,
        phone: phoneNo,
        email,
        leadAmount,
        source,
        expectedDate: datedate,
        notes,
      },
    });

    res.status(201).send(lead);
  } catch (err) {
    res.send(err);
  }
});

router.post('/add', async (req, res) => {
  const {
    name,
    status,
    phoneNo,
    email,
    companyId,
    agentId,
    leadAmount,
    source,
    expectedDate,
    notes,
  } = req.body;

  try {
    const lead = await db.lead.create({
      data: {
        companyId,
        agentId,
        name,
        status,
        phone: phoneNo,
        email,
        leadAmount,
        source,
        expectedDate,
        notes,
      },
    });

    res.status(201).send(lead);
  } catch (err) {
    res.send(err);
  }
});

router.patch('/update', async (req, res) => {
  const {
    name,
    status,
    phoneNo,
    email,
    companyId,
    agentId,
    leadId,
    leadAmount,
    source,
    expectedDate,
    notes,
  } = req.body;

  try {
    const lead = await db.lead.update({
      where: {
        companyId,
        agentId,
        id: leadId,
      },
      data: {
        companyId,
        agentId,
        name,
        status,
        phone: phoneNo,
        email,
        leadAmount,
        source,
        expectedDate,
        notes,
      },
    });

    res.status(201).send(lead);
  } catch (err) {
    res.send(err);
  }
});

router.delete('/delete', async (req, res) => {
  const { companyId, agentId, leadId } = req.body;

  try {
    const lead = await db.lead.delete({
      where: {
        companyId,
        agentId,
        id: leadId,
      },
    });

    res.status(200).send(lead);
  } catch (err) {
    res.send(err);
  }
});

export { router as manageLeads };
