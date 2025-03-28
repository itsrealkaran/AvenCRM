import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import axios from 'axios';
import { uploadFile } from '../utils/s3.js';

const MetaController = {
    async getFacebookAccessToken(req: Request, res: Response) {
        try {
            const { code } = req.params;
            console.log('Code:', code);
            const response = await axios.get(
            `https://graph.facebook.com/v22.0/oauth/access_token?client_id=${process.env.META_ADS_CLIENT_ID}&client_secret=${process.env.META_ADS_CLIENT_SECRET}&code=${code}`
            );
            console.log('Response:', response);
            return res.status(200).json({access_token: response.data.access_token});
        } catch (error) {
            return res.status(500).json({ message: 'Internal server error' });
        }
    },

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

            const { name, email, accessToken, pageId } = req.body;

            const metaAdAccount = await prisma.metaAdAccount.create({
                data: {
                    name, email, accessToken, pageId, agentId: user.id,
                },
            });

            return res.status(201).json(metaAdAccount);
        } catch (error) {
            return res.status(500).json({ message: 'Internal server error' });
        }
    },

    async uploadImage(req: Request, res: Response) {
        try {
            const user = req.user;
            if (!user) {
                return res.status(401).json({ message: 'Unauthorized' });
            }
            const image = req.file;
            console.log(image, 'image');

            if (!image) {
                return res.status(400).json({ message: 'No image provided' });
            }

            const imageUrl = await uploadFile(image.buffer, image.originalname + '-' + Date.now(), image.mimetype, 'public');

            return res.status(200).json({ imageUrl });
        } catch (error) {
            return res.status(500).json({ message: 'Internal server error' });
        }
    },

    async getLeadForms(req: Request, res: Response) {
        try {
            const user = req.user;
            if (!user) {
                return res.status(401).json({ message: 'Unauthorized' });
            }

            const leadForms = await prisma.leadForm.findMany({
                where: {
                    agentId: user.id,
                },
            });

            return res.status(200).json(leadForms);
        } catch (error) {
            return res.status(500).json({ message: 'Internal server error' });
        }
    },

    async createLeadForm(req: Request, res: Response) {
        try {
            const user = req.user;
            if (!user) {
                return res.status(401).json({ message: 'Unauthorized' });
            }

            const { name, questions, formId } = req.body;

            const leadForm = await prisma.leadForm.create({
                data: {
                    name, questions, agentId: user.id, formId,
                },
            });

            return res.status(201).json(leadForm);
        } catch (error) {
            return res.status(500).json({ message: 'Internal server error' });
        }
    }
}

export default MetaController;