export interface EmailAccount {
  id: string
  email: string
  provider: "GMAIL" | "OUTLOOK"
}

export interface EmailTemplate {
  id: string
  name: string
  subject: string
  content: string
  variables?: string[]
}

export interface EmailRecipient {
  id: string
  email: string
  name: string
}

export interface EmailCampaign {
  id: string
  title: string
  subject: string
  content: string
  recipientIds: string[]
  templateId?: string
  status: "Draft" | "Scheduled" | "Sent" | "Cancelled"
  createdAt: string
  scheduledAt?: string
}

export interface InboxEmail {
  id: string
  subject: string
  from: string
  receivedAt: string
  content: string
}

