import { Agent } from './agents';
import { Company } from './company';

export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
  SUBSCRIPTION = 'SUBSCRIPTION',
  COMMISSION = 'COMMISSION',
}

enum PlanTier {
  BASIC = 'BASIC',
  PROFESSIONAL = 'PROFESSIONAL',
  ENTERPRISE = 'ENTERPRISE',
  CUSTOM = 'CUSTOM',
}

export enum TransactionMethod {
  CARD = 'CARD',
  BANK_TRANSFER = 'BANK_TRANSFER',
  CASH = 'CASH',
}

export interface Transaction {
  id: string;

  // Relations
  company: Company;
  companyId: string;
  agent: Agent;
  agentId: string;

  // Transaction Details
  amount: number;
  date: string | Date;
  type: TransactionType;
  planType?: PlanTier;
  isVerfied: boolean;

  // Invoice and Billing
  invoiceNumber?: string;
  taxRate?: number;
  totalAmount?: number;

  // Additional Financial Info
  transactionMethod?: TransactionMethod;
  receiptUrl?: string;

  // Timestamps
  createdAt: string | Date;
  updatedAt: string | Date;
}
