import { Router } from 'express';
import db from '../../db/index';

const router = Router();

//managing leads

router.get('/getall', async (req, res) => {
  const { companyId, agentId } = req.body;

  try {
    const leads = await db.lead.findMany({
      where: {
        companyId,
        agentId,
      },
    });

    res.status(200).send(leads);
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
