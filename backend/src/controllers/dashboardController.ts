import { Request, Response } from 'express';
import prisma from '../db/index.js';
import { UserRole, DealStatus, LeadStatus } from '@prisma/client';

// Helper function to calculate growth rate
const calculateGrowthRate = (current: number, previous: number): number => {
  if (previous === 0) return 100;
  return Number((((current - previous) / previous) * 100).toFixed(2));
};

// Get data for the last 6 months
const getLastSixMonthsData = () => {
  const today = new Date();
  const sixMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 5, 1);
  return sixMonthsAgo;
};

// Helper function to get monthly data
const getMonthlyData = async (startDate: Date, companyId: string) => {
  const monthlyRevenue = await prisma.transaction.groupBy({
    by: ['createdAt'],
    where: {
      companyId,
      type: 'INCOME',
      createdAt: {
        gte: startDate,
      },
    },
    _sum: {
      amount: true,
    },
  });

  return monthlyRevenue;
};

// Helper function to get previous month's data
const getPreviousMonthData = async (companyId: string) => {
  const today = new Date();
  const firstDayOfCurrentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const firstDayOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);

  const lastMonthDeals = await prisma.deal.count({
    where: {
      companyId,
      createdAt: {
        gte: firstDayOfLastMonth,
        lt: firstDayOfCurrentMonth
      }
    }
  });

  const lastMonthActiveLeads = await prisma.lead.count({
    where: {
      companyId,
      status: {
        in: ['NEW', 'CONTACTED', 'QUALIFIED', 'NEGOTIATION']
      },
      createdAt: {
        gte: firstDayOfLastMonth,
        lt: firstDayOfCurrentMonth
      }
    }
  });

  const lastMonthWonDeals = await prisma.deal.count({
    where: {
      companyId,
      status: 'CLOSED_WON',
      createdAt: {
        gte: firstDayOfLastMonth,
        lt: firstDayOfCurrentMonth
      }
    }
  });

  const lastMonthRevenue = await prisma.transaction.aggregate({
    where: {
      companyId,
      type: 'INCOME',
      createdAt: {
        gte: firstDayOfLastMonth,
        lt: firstDayOfCurrentMonth
      }
    },
    _sum: {
      amount: true
    }
  });

  return {
    deals: lastMonthDeals,
    activeLeads: lastMonthActiveLeads,
    wonDeals: lastMonthWonDeals,
    revenue: lastMonthRevenue._sum.amount || 0
  };
};

export const getSuperAdminDashboard = async (req: Request, res: Response) => {
  try {
    const sixMonthsAgo = getLastSixMonthsData();

    // Get monthly revenue data
    const monthlyRevenue = await prisma.transaction.groupBy({
      by: ['createdAt'],
      where: {
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

    // Get current month's data
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

    // Get last month's data for growth calculation
    const lastMonthData = await getPreviousMonthData(companyId);

    // Calculate growth rates
    const growthRates = {
      deals: calculateGrowthRate(deals, lastMonthData.deals),
      activeLeads: calculateGrowthRate(activeLeads, lastMonthData.activeLeads),
      wonDeals: calculateGrowthRate(wonDeals, lastMonthData.wonDeals),
      revenue: calculateGrowthRate(revenue._sum.amount || 0, lastMonthData.revenue)
    };

    // Get monthly performance data with more details
    const monthlyPerformance = await prisma.deal.groupBy({
      by: ['createdAt', 'status'],
      where: {
        companyId,
        createdAt: {
          gte: sixMonthsAgo,
        },
      },
      _count: true,
      _sum: {
        dealAmount: true,
      },
    });

    // Get top performing agents
    const topAgents = await prisma.deal.groupBy({
      by: ['agentId'],
      where: {
        companyId,
        status: 'CLOSED_WON',
      },
      _count: true,
      _sum: {
        dealAmount: true,
      },
      orderBy: {
        _sum: {
          dealAmount: 'desc',
        },
      },
      take: 5,
    });

    // Get agent details for top performers
    const agentDetails = await Promise.all(
      topAgents.map(async (agent) => {
        const user = await prisma.user.findUnique({
          where: { id: agent.agentId },
          select: { name: true, email: true },
        });
        return {
          name: user?.name,
          email: user?.email,
          deals: agent._count,
          revenue: agent._sum.dealAmount,
        };
      })
    );

    // Get lead conversion metrics
    const leadMetrics = await prisma.lead.groupBy({
      by: ['status'],
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
      growthRates,
      performanceData: monthlyPerformance.map((item) => ({
        month: new Date(item.createdAt).toLocaleString('default', { month: 'short' }),
        deals: item._count,
        status: item.status,
        revenue: item._sum?.dealAmount || 0,
      })),
      topPerformers: agentDetails,
      leadMetrics: leadMetrics.map((metric) => ({
        status: metric.status,
        count: metric._count,
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

export const getMonitoringData = async (req: Request, res: Response) => {
  try {
    const companyId = req.user?.companyId;
    if (!companyId) {
      return res.status(400).json({ error: 'Company ID not found' });
    }

    const sixMonthsAgo = await getLastSixMonthsData();

    // Get total agents
    const totalAgents = await prisma.user.count({
      where: {
        companyId,
        role: 'AGENT',
      },
    });

    const previousMonthAgents = await prisma.user.count({
      where: {
        companyId,
        role: 'AGENT',
        createdAt: {
          lt: new Date(new Date().setMonth(new Date().getMonth() - 1)),
        },
      },
    });

    // Get revenue metrics
    const totalRevenue = await prisma.transaction.aggregate({
      where: {
        companyId,
        type: 'INCOME',
      },
      _sum: {
        amount: true,
      },
    });

    const previousMonthRevenue = await prisma.transaction.aggregate({
      where: {
        companyId,
        type: 'INCOME',
        createdAt: {
          lt: new Date(new Date().setMonth(new Date().getMonth() - 1)),
        },
      },
      _sum: {
        amount: true,
      },
    });

    // Get average deal size
    const dealsWithAmount = await prisma.deal.aggregate({
      where: {
        companyId,
        status: 'CLOSED_WON',
      },
      _avg: {
        dealAmount: true,
      },
      _count: true,
    });

    // Get pipeline conversion data
    const pipelineData = await prisma.deal.groupBy({
      by: ['status'],
      where: {
        companyId,
      },
      _count: true,
    });

    // Get monthly revenue trend
    const monthlyRevenue = await getMonthlyData(sixMonthsAgo, companyId);

    // Get top performing agents
    const topAgents = await prisma.deal.groupBy({
      by: ['agentId'],
      where: {
        companyId,
        status: 'CLOSED_WON',
      },
      _count: true,
      _sum: {
        dealAmount: true,
      },
      orderBy: {
        _sum: {
          dealAmount: 'desc',
        },
      },
      take: 5,
    });

    // Get agent details
    const agentDetails = await Promise.all(
      topAgents.map(async (agent) => {
        const user = await prisma.user.findUnique({
          where: { id: agent.agentId },
          select: { name: true },
        });
        return {
          name: user?.name,
          deals: agent._count,
          revenue: agent._sum.dealAmount,
        };
      })
    );

    // Calculate growth rates
    const agentGrowth = calculateGrowthRate(totalAgents, previousMonthAgents);
    const revenueGrowth = calculateGrowthRate(
      totalRevenue._sum.amount || 0,
      previousMonthRevenue._sum.amount || 0
    );

    res.json({
      totalAgents,
      agentGrowth,
      totalRevenue: totalRevenue._sum.amount || 0,
      revenueGrowth,
      avgDealSize: dealsWithAmount._avg.dealAmount || 0,
      conversionRate: (dealsWithAmount._count / (await prisma.lead.count({ where: { companyId } }))) * 100,
      pipelineData: pipelineData.map((item) => ({
        name: item.status,
        value: item._count,
      })),
      revenueTrend: monthlyRevenue.map((item) => ({
        month: new Date(item.createdAt).toLocaleString('default', { month: 'short' }),
        revenue: item._sum.amount || 0,
      })),
      agentPerformance: agentDetails,
    });
  } catch (error) {
    console.error('Error in getMonitoringData:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
