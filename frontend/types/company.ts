import { PlanTier } from './enums';
import { User } from './user';

export interface Company {
  id: string;
  name: string;
  email: string;
  size?: number;
  planId: string;
  planStart: Date;
  planEnd: Date;
  address?: string;
  phone?: string;
  website?: string;
  adminId: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface Plan {
  id: string;
  name: PlanTier;
  price: number;
  maxUsers: number;
  features?: Record<string, any>;
  createdAt: Date;
  updatedAt?: Date;
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  companyId: string;
  teamLeaderId?: string;
  members?: User[];
  createdAt: Date;
  updatedAt?: Date;
}
