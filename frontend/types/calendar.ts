export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start: Date;
  end: Date;
  setterId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CompanyAuditLog {
  id: string;
  companyId: string;
  action: string;
  entityType: string;
  entityId: string;
  performedBy: string;
  details?: Record<string, any>;
  createdAt: Date;
}

export interface PageBuilder {
  id: string;
  title: string;
  content: Record<string, any>;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdById: string;
  allowedAdmins: string[];
}
