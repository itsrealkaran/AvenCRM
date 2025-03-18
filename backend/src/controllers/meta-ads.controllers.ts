import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';

const MetaController = {
    async getMetaAdAccounts(req: Request, res: Response) {
        try {
            const user = req.user;
            if (!user) {
                return res.status(401).json({ message: 'Unauthorized' });
            }

            const metaAdAccounts = await prisma.metaAdAccount.findMany({
                where: {
                    agentId: user.id,
                },
            });

            return res.status(200).json(metaAdAccounts);
        } catch (error) {
            return res.status(500).json({ message: 'Internal server error' });
        }
    },

    async createMetaAdAccount(req: Request, res: Response) {
        try {
            const user = req.user;
            if (!user) {
                return res.status(401).json({ message: 'Unauthorized' });
            }

            const { name, email, accessToken } = req.body;

            const metaAdAccount = await prisma.metaAdAccount.create({
                data: {
                    name, email, accessToken, agentId: user.id,
                },
            });

            return res.status(201).json(metaAdAccount);
        } catch (error) {
            return res.status(500).json({ message: 'Internal server error' });
        }
    }
}

export default MetaController;