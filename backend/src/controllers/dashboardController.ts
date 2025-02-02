import { Request, Response } from 'express';
import prisma from '../db/index.js';

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
      status: 'WON',
      createdAt: {
        gte: firstDayOfLastMonth,
        lt: firstDayOfCurrentMonth
      }
    }
  });

  const lastMonthRevenue = await prisma.transaction.aggregate({
    where: {
      companyId,
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
    const totalRevenue = await prisma.payments.aggregate({
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
        status: 'WON',
      },
    });

    const revenueData = await prisma.transaction.groupBy({
      where: {
        companyId,
      },
      by: ['id', 'amount', 'commissionRate'],
      _sum: {
        amount: true,
      },
    });

    const totalRevenue = revenueData.reduce((sum, transaction) => sum + transaction.amount, 0);
    const commissionRevenue = revenueData.reduce((sum, transaction) => {
      const commissionRate = transaction.commissionRate || 0;
      return sum + (transaction.amount * (commissionRate / 100));
    }, 0);

    const revenue = {
      totalRevenue,
      commissionRevenue,
    };

    // Get last month's data for growth calculation
    const lastMonthData = await getPreviousMonthData(companyId);

    // Calculate growth rates
    const growthRates = {
      deals: calculateGrowthRate(deals, lastMonthData.deals),
      activeLeads: calculateGrowthRate(activeLeads, lastMonthData.activeLeads),
      wonDeals: calculateGrowthRate(wonDeals, lastMonthData.wonDeals),
      revenue: calculateGrowthRate(revenue.totalRevenue, lastMonthData.revenue)
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

    const performanceData = Object.values(
      monthlyPerformance.reduce((acc, item) => {
        const month = item.createdAt.toISOString().split('T')[0].substring(0, 7);
        if (!acc[month]) {
          acc[month] = {
            month,
            dealCount: 0,
            totalAmount: 0
          };
        }
        acc[month].dealCount += item._count;
        acc[month].totalAmount += item._sum.dealAmount || 0;
        return acc;
      }, {} as Record<string, { month: string; dealCount: number; totalAmount: number }>)
    );

    // Get top performing agents
    const topAgents = await prisma.deal.groupBy({
      by: ['agentId'],
      where: {
        companyId,
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

    // Get lead conversion metrics grouped by month
    const monthlyLeads = await prisma.lead.groupBy({
      by: ['createdAt'],
      where: {
        companyId,
        createdAt: {
          gte: sixMonthsAgo,
        },
      },
      _count: true,
    });

    const monthlyDeals = await prisma.deal.groupBy({
      by: ['createdAt'],
      where: {
        companyId,
        createdAt: {
          gte: sixMonthsAgo,
        },
      },
      _count: true,
    });

    // Create a map to store combined metrics by month
    const metricsByMonth = new Map<string, { month: string; leads: number; deals: number }>();

    // Process leads
    monthlyLeads.forEach((item) => {
      const month = item.createdAt.toISOString().split('T')[0].substring(0, 7);
      if (!metricsByMonth.has(month)) {
        metricsByMonth.set(month, { month, leads: 0, deals: 0 });
      }
      metricsByMonth.get(month)!.leads += item._count;
    });

    // Process deals
    monthlyDeals.forEach((item) => {
      const month = item.createdAt.toISOString().split('T')[0].substring(0, 7);
      if (!metricsByMonth.has(month)) {
        metricsByMonth.set(month, { month, leads: 0, deals: 0 });
      }
      metricsByMonth.get(month)!.deals += item._count;
    });

    // Convert to array and sort by month
    const leadMetrics = Array.from(metricsByMonth.values())
      .sort((a, b) => a.month.localeCompare(b.month));

    res.json({
      totalDeals: deals,
      activeLeads,
      wonDeals,
      revenue,
      growthRates,
      performanceData,
      topPerformers: agentDetails,
      leadMetrics: leadMetrics.map((metric) => ({
        month: metric.month,
        leads: metric.leads,
        deals: metric.deals,
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
        status: 'WON',
      },
      _sum: {
        dealAmount: true,
      },
    });

    // Get monthly performance data
    const leads = await prisma.lead.groupBy({
      by: ['createdAt'],
      where: {
        agentId: userId,
        createdAt: {
          gte: sixMonthsAgo,
        },
      },
      _count: true,
    });

    const deals = await prisma.deal.groupBy({
      by: ['createdAt'],
      where: {
        agentId: userId,
        createdAt: {
          gte: sixMonthsAgo,
        },
      },
      _count: true,
    });

    // Create a map to store combined metrics by month
    const metricsByMonth = new Map<string, { month: string; leads: number; deals: number }>();

    // Process leads
    leads.forEach((item) => {
      const month = item.createdAt.toISOString().split('T')[0].substring(0, 7);
      if (!metricsByMonth.has(month)) {
        metricsByMonth.set(month, { month, leads: 0, deals: 0 });
      }
      metricsByMonth.get(month)!.leads += item._count;
    });

    // Process deals
    deals.forEach((item) => {
      const month = item.createdAt.toISOString().split('T')[0].substring(0, 7);
      if (!metricsByMonth.has(month)) {
        metricsByMonth.set(month, { month, leads: 0, deals: 0 });
      }
      metricsByMonth.get(month)!.deals += item._count;
    });

    // Convert to array and sort by month
    const monthlyPerformance = Array.from(metricsByMonth.values())
      .sort((a, b) => a.month.localeCompare(b.month));

    res.json({
      totalLeads: myLeads,
      totalDeals: myDeals,
      pendingTasks: myTasks,
      revenue: myRevenue?._sum.dealAmount || 0,
      performanceData: monthlyPerformance.map((item) => ({
        month: new Date(item.month).toLocaleString('default', { month: 'short' }),
        deals: item.deals,
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
    const revenueData = await prisma.transaction.groupBy({
      where: {
        companyId,
      },
      by: ['id', 'amount', 'commissionRate'],
      _sum: {
        amount: true,
      },
    });

    const totalRevenue = revenueData.reduce((sum, transaction) => sum + transaction.amount, 0);
    const commissionRevenue = revenueData.reduce((sum, transaction) => {
      const commissionRate = transaction.commissionRate || 0;
      return sum + (transaction.amount * (commissionRate / 100));
    }, 0);
    const grossRevenue = totalRevenue + commissionRevenue;

    const revenue = {
      totalRevenue,
      commissionRevenue,
      grossRevenue
    };

    const previousMonthRevenue = await prisma.transaction.aggregate({
      where: {
        companyId,
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
        status: 'WON',
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
        status: 'WON',
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
      revenue.grossRevenue,
      previousMonthRevenue._sum.amount || 0
    );

    res.json({
      totalAgents,
      agentGrowth,
      totalRevenue: revenue.totalRevenue,
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
