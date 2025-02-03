import { TransactionStatus, TransactionType } from './enums';

export interface Transaction {
  id: string;
  companyId: string;
  amount: number;
  date: Date;
  agentId: string;
  agent?: {
    id: string;
    name: string;
    email: string;
  };
  transactionType: TransactionType;
  isApprovedByTeamLeader: TransactionStatus;
  status: TransactionStatus;
  isVerfied: boolean;
  invoiceNumber?: string;
  commissionRate?: number;
  totalAmount?: number;
  transactionMethod?: string;
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
