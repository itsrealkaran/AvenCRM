'use client';

import React from 'react';
import {
  BarChart3,
  Users,
  Building2,
  TrendingUp,
  DollarSign,
  Package,
  Activity,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { DataTable } from '@/components/common-table';
import { columns } from '@/components/companies-table/columns';
import OverViewPage from '@/components/charts/_components/overview';

const revenueData = [
  { month: 'Jan', revenue: 15000 },
  { month: 'Feb', revenue: 25000 },
  { month: 'Mar', revenue: 18000 },
  { month: 'Apr', revenue: 30000 },
  { month: 'May', revenue: 40000 },
  { month: 'Jun', revenue: 35000 },
];

const customerData = [
  { name: 'Enterprise', value: 45 },
  { name: 'Pro', value: 30 },
  { name: 'Basic', value: 25 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

function AdminPage() {
  return (
   <OverViewPage />
  );
}

export default AdminPage;
