import { Router } from 'express';
import db from '../../db';

const router = Router();

router.get('/agentsCount', async (req, res) => {
  const { companyId } = req.body;

  try {
    const agents = await db.agent.findMany({
      where: {
        companyId,
      },
    });

    res.send(agents.length);
  } catch (err) {
    res.status(500).send(err);
  }
});

router.get('/sales', async (req, res) => {
  try {
    const { companyId } = req.body;

    const leads = await db.lead.findMany({
      where: {
        companyId,
      },
    });

    const newLeads = leads.length;
    const leadsContacted = leads.filter((lead) => {
      return lead.status === 'CONTACTED';
    }).length;
    const proposals = leads.filter((lead) => {
      return lead.status === 'QUALIFIED';
    }).length;
    const negotiation = leads.filter((lead) => {
      return lead.status === 'NEGOTIATION';
    }).length;
    const won = leads.filter((lead) => {
      return lead.status === 'WON';
    }).length;

    res
      .status(200)
      .json({ newLeads, leadsContacted, proposals, negotiation, won });
  } catch (err) {
    res.status(500).send(err);
  }
});

export { router as companyMonitoring };
