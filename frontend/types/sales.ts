import { DealStatus, LeadStatus, PropertyType } from './enums';

export interface BaseFilters {
  page?: number;
  limit?: number;
  startDate?: Date;
  endDate?: Date;
  createdById?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface LeadFilters extends BaseFilters {
  status?: LeadStatus;
  source?: string;
  type?: string;
  minBudget?: number;
  maxBudget?: number;
  location?: string;
}

export interface DealFilters extends BaseFilters {
  status?: DealStatus;
  minAmount?: number;
  maxAmount?: number;
  propertyType?: string;
  location?: string;
}
