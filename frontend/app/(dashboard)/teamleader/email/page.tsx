"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EmailMetricsCards } from "@/components/emails/email-metrics-cards"
import { ConnectedEmailAccounts } from "@/components/emails/connected-email-accounts"
import { EmailRecipientsList } from "@/components/emails/email-recipients-list"
import { EmailCampaignsList } from "@/components/emails/email-campaigns-list"
import { EmailInbox } from "@/components/emails/email-inbox"
import { ConnectEmailAccounts } from "@/components/emails/connect-email-accounts"
import { FaEnvelope } from "react-icons/fa"
import { fetchEmailAccounts } from "@/components/email/api"
import type { EmailAccount } from "@/types/email"
import { EmailTemplatesList } from "@/components/emails/email-templates-list"
import { Card } from "@/components/ui/card"

export default function EmailCampaignsPage() {
  const [connectedAccounts, setConnectedAccounts] = useState<EmailAccount[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadAccounts = async () => {
      try {
        const accounts = await fetchEmailAccounts()
        setConnectedAccounts(accounts)
      } catch (error) {
        console.error("Failed to fetch email accounts:", error)
      } finally {
        setIsLoading(false)
      }
    }
    loadAccounts()
  }, [])

  const handleConnect = async (newAccount: EmailAccount) => {
    setConnectedAccounts([...connectedAccounts, newAccount])
  }

  return (
    <Card className='p-6 space-y-6 min-h-full'>
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Email Management</h1>
          <p className="text-muted-foreground">Manage your email campaigns, inbox, and contacts</p>
        </div>
      </div>

      {connectedAccounts.length > 0 ? (
        <>
          <EmailMetricsCards />
          <Tabs defaultValue="campaigns" className="space-y-4">
            <TabsList>
              <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
              <TabsTrigger value="inbox">Inbox</TabsTrigger>
              <TabsTrigger value="accounts">Connected Accounts</TabsTrigger>
              <TabsTrigger value="recipients">Recipients</TabsTrigger>
              <TabsTrigger value="templates">Templates</TabsTrigger>
            </TabsList>
            <TabsContent value="campaigns">
              <EmailCampaignsList />
            </TabsContent>
            <TabsContent value="inbox">
              <EmailInbox />
            </TabsContent>
            <TabsContent value="accounts">
              <ConnectedEmailAccounts accounts={connectedAccounts} />
            </TabsContent>
            <TabsContent value="recipients">
              <EmailRecipientsList />
            </TabsContent>
            <TabsContent value="templates">
              <EmailTemplatesList />
            </TabsContent>
          </Tabs>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
          <ConnectEmailAccounts onConnect={handleConnect} />
        </div>
      )}
    </Card>
  )
}

