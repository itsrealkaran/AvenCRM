import { TransactionType, PlanTier } from './enums';

export interface Transaction {
  id: string;
  companyId: string;
  amount: number;
  date: Date;
  type: TransactionType;
  agentId: string;
  planType?: PlanTier;
  isVerfied: boolean;
  invoiceNumber?: string;
  taxRate?: number;
  totalAmount?: number;
  transactionMethod?: string;
  receiptUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SupportTicket {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  createdById: string;
  assignedTo?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface TicketComment {
  id: string;
  ticketId: string;
  content: string;
  createdBy: string;
  createdAt: Date;
}
