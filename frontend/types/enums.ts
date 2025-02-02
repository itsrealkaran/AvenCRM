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
  NEW = 'NEW',
  DISCOVERY = 'DISCOVERY',
  PROPOSAL = 'PROPOSAL',
  UNDER_CONTRACT = 'UNDER_CONTRACT',
  NEGOTIATION = 'NEGOTIATION',
  WON = 'WON',
}

// export enum PropertyType {
//   RESIDENTIAL = 'RESIDENTIAL',
//   COMMERCIAL = 'COMMERCIAL',
//   LAND = 'LAND',
// }

// export enum PropertyStatus {
//   ACTIVE = 'ACTIVE',
//   PENDING = 'PENDING',
//   SOLD = 'SOLD',
//   INACTIVE = 'INACTIVE',
// }

export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
  SUBSCRIPTION = 'SUBSCRIPTION',
  COMMISSION = 'COMMISSION',
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
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
