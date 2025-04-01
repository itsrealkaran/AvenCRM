import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import axios from 'axios';
import { uploadFile } from '../utils/s3.js';

const MetaController = {
    async getFacebookAccessToken(req: Request, res: Response) {
        try {
            for (let i = 0; i < 3; i++) {
                try {
                    const { code } = req.params;
                    const response = await fetch(
                        `https://graph.facebook.com/v22.0/oauth/access_token?client_id=${process.env.META_ADS_CLIENT_ID}&client_secret=${process.env.META_ADS_CLIENT_SECRET}&code=${code}`,
                    );
                    const data: any = await response.json();
                    return res.status(200).json({ access_token: data.access_token });
                } catch (error: any) {
                    console.error('Facebook API Error:', error);
                }
            }
            return res.status(500).json({ 
                error: 'UNKNOWN_ERROR',
                code: 'UNKNOWN_ERROR'
            });
        } catch (error: any) {
            console.error('Facebook API Error:', error.message);
            return res.status(500).json({ 
                error: error,
                code: error.code || 'UNKNOWN_ERROR'
            });
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
    },

    async deleteMetaAdAccount(req: Request, res: Response) {
        try {
            const user = req.user;
            if (!user) {
                return res.status(401).json({ message: 'Unauthorized' });
            }

            const { id } = req.params;

            await prisma.metaAdAccount.delete({
                where: { id },
            });

            return res.status(200).json({ message: 'Meta Ad Account deleted successfully' });
        } catch (error) {
            return res.status(500).json({ error, message: 'Internal server error' });
        }
    }
}

export default MetaController;