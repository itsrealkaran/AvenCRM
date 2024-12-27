export enum UserRole {
  SUPERADMIN = 'SUPERADMIN',
  ADMIN = 'ADMIN',
  TEAM_LEADER = 'TEAM_LEADER',
  AGENT = 'AGENT',
}

export enum LeadStatus {
  NEW = 'NEW',
  CONTACTED = 'CONTACTED',
  QUALIFIED = 'QUALIFIED',
  NEGOTIATION = 'NEGOTIATION',
  WON = 'WON',
  LOST = 'LOST',
  FOLLOWUP = 'FOLLOWUP',
}

export enum DealStatus {
  PROSPECT = 'PROSPECT',
  ACTIVE = 'ACTIVE',
  UNDER_CONTRACT = 'UNDER_CONTRACT',
  CLOSED_WON = 'CLOSED_WON',
  CLOSED_LOST = 'CLOSED_LOST',
}

export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
  SUBSCRIPTION = 'SUBSCRIPTION',
  COMMISSION = 'COMMISSION',
}

export enum PlanTier {
  BASIC = 'BASIC',
  PROFESSIONAL = 'PROFESSIONAL',
  ENTERPRISE = 'ENTERPRISE',
  CUSTOM = 'CUSTOM',
}

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHERS = 'OTHERS',
}

export enum EmailStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  FAILED = 'FAILED',
  SCHEDULED = 'SCHEDULED',
}

export enum EmailProvider {
  GMAIL = 'GMAIL',
  OUTLOOK = 'OUTLOOK',
}

export enum EmailAccountStatus {
  ACTIVE = 'ACTIVE',
  NEEDS_REAUTH = 'NEEDS_REAUTH',
  DISABLED = 'DISABLED',
}

export enum EmailCampaignStatus {
  DRAFT = 'DRAFT',
  SCHEDULED = 'SCHEDULED',
  SENDING = 'SENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}
