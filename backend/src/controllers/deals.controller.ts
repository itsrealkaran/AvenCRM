import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { DealFilter } from '../types/filters.js';
import { UserRole } from '@prisma/client';
import { subMonths } from 'date-fns';

export const getAllDeals = async (req: Request, res: Response) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const filters = req.query as DealFilter;
        const page = Number(filters.page) || 1;
        const limit = Number(filters.limit) || 10;
        const skip = (page - 1) * limit;

        // Default date range is last month if not specified
        const startDate = filters.startDate ? new Date(filters.startDate) : subMonths(new Date(), 1);
        const endDate = filters.endDate ? new Date(filters.endDate) : new Date();

        // Base query conditions
        const where: any = {
            createdAt: {
                gte: startDate,
                lte: endDate
            }
        };

        // Add company filter for admin
        if (user.role === UserRole.ADMIN) {
            where.companyId = user.companyId;
        } else if (user.role === UserRole.AGENT) {
            where.agentId = user.id;
        }

        // Add optional filters
        if (filters.createdById) {
            where.agentId = filters.createdById;
        }
        if (filters.status) {
            where.status = filters.status;
        }
        if (filters.minAmount) {
            where.dealAmount = {
                ...where.dealAmount,
                gte: Number(filters.minAmount)
            };
        }
        if (filters.maxAmount) {
            where.dealAmount = {
                ...where.dealAmount,
                lte: Number(filters.maxAmount)
            };
        }

        // Get total count for pagination
        const total = await prisma.deal.count({ where });

        // Get deals with pagination and filters
        const deals = await prisma.deal.findMany({
            where,
            include: {
                agent: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            },
            skip,
            take: limit,
            orderBy: filters.sortBy ? {
                [filters.sortBy]: filters.sortOrder || 'desc'
            } : {
                createdAt: 'desc'
            }
        });

        return res.json({
            data: deals,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('Error in getAllDeals:', error);
        return res.status(500).json({ message: 'Failed to fetch deals' });
    }
};
