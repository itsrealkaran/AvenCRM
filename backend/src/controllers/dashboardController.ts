import { Request, Response } from 'express';
import prisma from '../db/index.js';
import { UserRole, DealStatus, LeadStatus } from '@prisma/client';

// Helper function to calculate growth rate
const calculateGrowthRate = (current: number, previous: number): number => {
  if (previous === 0) return 100;
  return Number((((current - previous) / previous) * 100).toFixed(2));
};

// Get data for the last 6 months
const getLastSixMonthsData = async () => {
  const today = new Date();
  const sixMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 5, 1);
  return sixMonthsAgo;
};

export const getSuperAdminDashboard = async (req: Request, res: Response) => {
  try {
    const sixMonthsAgo = await getLastSixMonthsData();

    // Get monthly revenue data
    const monthlyRevenue = await prisma.transaction.groupBy({
      by: ['createdAt'],
      where: {
        type: 'INCOME',
        createdAt: {
          gte: sixMonthsAgo,
        },
      },
      _sum: {
        amount: true,
      },
    });

    // Get company growth data
    const companies = await prisma.company.count();
    const previousMonthCompanies = await prisma.company.count({
      where: {
        createdAt: {
          lt: new Date(new Date().setMonth(new Date().getMonth() - 1)),
        },
      },
    });

    // Get total users
    const users = await prisma.user.count();
    const previousMonthUsers = await prisma.user.count({
      where: {
        createdAt: {
          lt: new Date(new Date().setMonth(new Date().getMonth() - 1)),
        },
      },
    });

    // Calculate total revenue
    const totalRevenue = await prisma.transaction.aggregate({
      where: {
        type: 'INCOME',
      },
      _sum: {
        amount: true,
      },
    });

    // Calculate growth rates
    const growthRate = calculateGrowthRate(companies, previousMonthCompanies);
    const userGrowthRate = calculateGrowthRate(users, previousMonthUsers);

    // Format data for response
    const salesData = monthlyRevenue.map((item) => ({
      month: new Date(item.createdAt).toLocaleString('default', { month: 'short' }),
      revenue: item._sum.amount || 0,
      companies: companies,
    }));

    res.json({
      salesData,
      totalRevenue: totalRevenue._sum.amount || 0,
      totalCompanies: companies,
      totalUsers: users,
      growthRate,
      userGrowthRate,
    });
  } catch (error) {
    console.error('Error in getSuperAdminDashboard:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAdminDashboard = async (req: Request, res: Response) => {
  try {
    const companyId = req.user?.companyId;
    if (!companyId) {
      return res.status(400).json({ error: 'Company ID not found' });
    }

    const sixMonthsAgo = await getLastSixMonthsData();

    // Get company-specific data
    const deals = await prisma.deal.count({
      where: { companyId },
    });

    const activeLeads = await prisma.lead.count({
      where: {
        companyId,
        status: {
          in: ['NEW', 'CONTACTED', 'QUALIFIED', 'NEGOTIATION'],
        },
      },
    });

    const wonDeals = await prisma.deal.count({
      where: {
        companyId,
        status: 'CLOSED_WON',
      },
    });

    const revenue = await prisma.transaction.aggregate({
      where: {
        companyId,
        type: 'INCOME',
      },
      _sum: {
        amount: true,
      },
    });

    // Get monthly performance data
    const monthlyPerformance = await prisma.deal.groupBy({
      by: ['createdAt'],
      where: {
        companyId,
        createdAt: {
          gte: sixMonthsAgo,
        },
      },
      _count: true,
    });

    res.json({
      totalDeals: deals,
      activeLeads,
      wonDeals,
      revenue: revenue._sum.amount || 0,
      performanceData: monthlyPerformance.map((item) => ({
        month: new Date(item.createdAt).toLocaleString('default', { month: 'short' }),
        deals: item._count,
      })),
    });
  } catch (error) {
    console.error('Error in getAdminDashboard:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAgentDashboard = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(400).json({ error: 'User ID not found' });
    }

    const sixMonthsAgo = await getLastSixMonthsData();

    // Get agent-specific metrics
    const myLeads = await prisma.lead.count({
      where: { agentId: userId },
    });

    const myDeals = await prisma.deal.count({
      where: { agentId: userId },
    });

    const myTasks = await prisma.task.count({
      where: { userId: userId },
    });

    const myRevenue = await prisma.deal.aggregate({
      where: {
        agentId: userId,
        status: 'CLOSED_WON',
      },
      _sum: {
        dealAmount: true,
      },
    });

    // Get monthly performance data
    const monthlyPerformance = await prisma.deal.groupBy({
      by: ['createdAt'],
      where: {
        agentId: userId,
        createdAt: {
          gte: sixMonthsAgo,
        },
      },
      _count: true,
    });

    res.json({
      totalLeads: myLeads,
      totalDeals: myDeals,
      pendingTasks: myTasks,
      revenue: myRevenue._sum.dealAmount || 0,
      performanceData: monthlyPerformance.map((item) => ({
        month: new Date(item.createdAt).toLocaleString('default', { month: 'short' }),
        deals: item._count,
      })),
    });
  } catch (error) {
    console.error('Error in getAgentDashboard:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
