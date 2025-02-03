import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FaGoogle, FaMicrosoft } from "react-icons/fa"
import { connectEmailAccount } from "@/components/email/api"
import type { EmailAccount } from "@/types/email"

type EmailProvider = "GMAIL" | "OUTLOOK"

interface ConnectEmailAccountsProps {
  onConnect: (account: EmailAccount) => void
}

export function ConnectEmailAccounts({ onConnect }: ConnectEmailAccountsProps) {
  const [isConnecting, setIsConnecting] = useState(false)
  const [selectedProvider, setSelectedProvider] = useState<EmailProvider | null>(null)

  const handleConnect = async (provider: EmailProvider) => {
    setIsConnecting(true)
    setSelectedProvider(provider)
    try {
      const redirectUrl = await connectEmailAccount(provider)
      // In a real-world scenario, you'd redirect the user to this URL for OAuth
      console.log(`Redirect to: ${redirectUrl}`)
      // For demonstration purposes, we'll simulate a successful connection
      const mockAccount: EmailAccount = {
        id: Date.now().toString(),
        email: `user@${provider.toLowerCase()}.com`,
        provider: provider,
      }
      onConnect(mockAccount)
    } catch (error) {
      console.error(`Failed to connect ${provider} account:`, error)
    } finally {
      setIsConnecting(false)
      setSelectedProvider(null)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Connect Email Accounts</CardTitle>
        <CardDescription>Add your email accounts to start managing campaigns</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ConnectButton
            provider="GMAIL"
            icon={FaGoogle}
            label="Connect Gmail"
            onClick={() => handleConnect("GMAIL")}
            isLoading={isConnecting && selectedProvider === "GMAIL"}
          />
          <ConnectButton
            provider="OUTLOOK"
            icon={FaMicrosoft}
            label="Connect Outlook"
            onClick={() => handleConnect("OUTLOOK")}
            isLoading={isConnecting && selectedProvider === "OUTLOOK"}
          />
        </div>
      </CardContent>
    </Card>
  )
}

interface ConnectButtonProps {
  provider: EmailProvider
  icon: React.ElementType
  label: string
  onClick: () => void
  isLoading: boolean
}

function ConnectButton({ provider, icon: Icon, label, onClick, isLoading }: ConnectButtonProps) {
  const colors = {
    GMAIL: "bg-red-100 text-red-600 hover:bg-red-200",
    OUTLOOK: "bg-blue-100 text-blue-600 hover:bg-blue-200",
  }

  return (
    <Button
      variant="outline"
      className={`w-full h-20 text-left flex items-center space-x-4 ${colors[provider]}`}
      onClick={onClick}
      disabled={isLoading}
    >
      <Icon className="w-6 h-6" />
      <span>{isLoading ? "Connecting..." : label}</span>
    </Button>
  )
}

