export interface BaseFilter {
  page?: number;
  limit?: number;
  startDate?: Date;
  endDate?: Date;
  createdById?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface LeadFilter extends BaseFilter {
  status?: string;
  source?: string;
}

export interface DealFilter extends BaseFilter {
  status?: string;
  minAmount?: number;
  maxAmount?: number;
}

export interface TransactionFilter extends BaseFilter {
  type?: string;
  minAmount?: number;
  maxAmount?: number;
}
