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
      // Open in same window to properly handle the OAuth callback
      window.location.href = redirectUrl
    } catch (error) {
      console.error(`Failed to connect ${provider} account:`, error)
    } finally {
      setIsConnecting(false)
      setSelectedProvider(null)
    }
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Connect Your Email Account</CardTitle>
        <CardDescription className="text-center">
          Choose your email provider to get started with email management
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ConnectButton
            provider="GMAIL"
            icon={FaGoogle}
            label="Connect Gmail"
            description="Sync your Google workspace emails"
            onClick={() => handleConnect("GMAIL")}
            isLoading={isConnecting && selectedProvider === "GMAIL"}
          />
          <ConnectButton
            provider="OUTLOOK"
            icon={FaMicrosoft}
            label="Connect Outlook"
            description="Sync your Microsoft 365 emails"
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
  description: string
  onClick: () => void
  isLoading: boolean
}

function ConnectButton({ provider, icon: Icon, label, description, onClick, isLoading }: ConnectButtonProps) {
  const styles = {
    GMAIL: {
      button: "bg-white hover:bg-red-50 border-red-200 hover:border-red-300",
      icon: "text-red-500",
      text: "text-red-700"
    },
    OUTLOOK: {
      button: "bg-white hover:bg-blue-50 border-blue-200 hover:border-blue-300",
      icon: "text-blue-500", 
      text: "text-blue-700"
    }
  }

  return (
    <Button
      variant="outline"
      className={`w-full h-32 p-6 flex flex-col items-center justify-center space-y-2 transition-all duration-200 ${styles[provider].button}`}
      onClick={onClick}
      disabled={isLoading}
    >
      <Icon className={`w-8 h-8 ${styles[provider].icon}`} />
      <div className="text-center">
        <div className={`font-semibold ${styles[provider].text}`}>
          {isLoading ? "Connecting..." : label}
        </div>
        <div className="text-sm text-gray-500 mt-1">{description}</div>
      </div>
    </Button>
  )
}
