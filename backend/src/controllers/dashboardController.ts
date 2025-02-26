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

    // Get consolidated revenue data for the past 6 months
    const revenueData = await prisma.transaction.groupBy({
      where: {
        companyId,
        createdAt: {
          gte: sixMonthsAgo,
        },
      },
      by: ['createdAt'],
      _sum: {
        amount: true,
      },
      _max: {
        commissionRate: true,
      },
    });

    // Calculate total and commission revenue in one pass
    const { totalRevenue, commissionRevenue } = revenueData.reduce((acc, transaction) => ({
      totalRevenue: acc.totalRevenue + (transaction._sum.amount || 0),
      commissionRevenue: acc.commissionRevenue + ((transaction._sum.amount || 0) * ((transaction._max.commissionRate || 0) / 100))
    }), { totalRevenue: 0, commissionRevenue: 0 });

    const revenue = { totalRevenue, commissionRevenue };

    // Get last month's data for growth calculation
    const lastMonthData = await getPreviousMonthData(companyId);

    // Calculate growth rates
    const growthRates = {
      deals: calculateGrowthRate(deals, lastMonthData.deals),
      activeLeads: calculateGrowthRate(activeLeads, lastMonthData.activeLeads),
      wonDeals: calculateGrowthRate(wonDeals, lastMonthData.wonDeals),
      revenue: calculateGrowthRate(totalRevenue, lastMonthData.revenue)
    };

    // Get revenue data for the past 6 months
    const monthlyRevenue = await prisma.transaction.groupBy({
      by: ['createdAt'],
      where: {
        companyId,
        createdAt: {
          gte: sixMonthsAgo,
        },
      },
      _sum: {
        amount: true,
      },
      _max: {
        commissionRate: true,
      },
    });

    const performanceData = Object.values(
      monthlyRevenue.reduce((acc, item) => {
        const month = item.createdAt.toLocaleString('default', { month: 'long' });
        if (!acc[month]) {
          acc[month] = {
            month,
            totalRevenue: 0,
            commissionRevenue: 0
          };
        }

        // Directly use the current item instead of searching through monthlyRevenue again
        const amount = item._sum.amount || 0;
        const commissionRate = item._max.commissionRate || 0;
        
        acc[month].totalRevenue = amount;
        acc[month].commissionRevenue = amount * (commissionRate / 100);

        return acc;
      }, {} as Record<string, { 
        month: string; 
        totalRevenue: number;
        commissionRevenue: number;
      }>)
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
      const month = item.createdAt.toLocaleString('default', { month: 'long' });
      if (!metricsByMonth.has(month)) {
        metricsByMonth.set(month, { month, leads: 0, deals: 0 });
      }
      metricsByMonth.get(month)!.leads += item._count;
    });

    // Process deals
    monthlyDeals.forEach((item) => {
      const month = item.createdAt.toLocaleString('default', { month: 'long' });
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

    const transactions = await prisma.transaction.findMany({
      where: {
        agentId: userId,
        createdAt: {
          gte: sixMonthsAgo,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        amount: true,
        commissionRate: true,
        createdAt: true,
      },
    });

    // Calculate revenue metrics
    const { grossRevenue, myRevenue, revenueByMonth } = transactions.reduce((acc, transaction) => {
      const commissionRate = transaction.commissionRate || 0;
      const month = new Date(transaction.createdAt).toLocaleString('default', { month: 'short' });
      
      // Update total revenues
      acc.grossRevenue += transaction.amount;
      acc.myRevenue += transaction.amount * (commissionRate / 100);
      
      // Update monthly data
      if (!acc.revenueByMonth[month]) {
        acc.revenueByMonth[month] = { grossRevenue: 0, myRevenue: 0 };
      }
      acc.revenueByMonth[month].grossRevenue += transaction.amount;
      acc.revenueByMonth[month].myRevenue += transaction.amount * (commissionRate / 100);
      
      return acc;
    }, {
      grossRevenue: 0,
      myRevenue: 0,
      revenueByMonth: {} as Record<string, { grossRevenue: number; myRevenue: number }>
    });

    // Convert revenueByMonth to array format
    const performanceData = Object.entries(revenueByMonth).map(([month, revenue]) => ({
      month,
      grossRevenue: revenue.grossRevenue,
      myRevenue: revenue.myRevenue
    }));

    // Get all deals for the last 6 months
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

    // Create an array of the last 6 months
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      return date.toLocaleString('default', { month: 'short' }); // Format: YYYY-MM
    }).reverse();

    // Create a map of existing deals data
    const dealsMap = deals.reduce((acc, item) => {
      const month = item.createdAt.toLocaleString('default', { month: 'short' });
      acc[month] = item._count;
      return acc;
    }, {} as Record<string, number>);

    // Fill in the data for all months
    const dealsClosureTrends = last6Months.map(month => ({
      month,
      deals: dealsMap[month] || 0
    }));

    res.json({
      totalLeads: myLeads,
      totalDeals: myDeals,
      pendingTasks: myTasks,
      revenue: { grossRevenue, myRevenue },
      performanceData,
      dealsClosureTrends,
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
