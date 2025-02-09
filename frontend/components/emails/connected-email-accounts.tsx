import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FaEnvelope, FaTrash, FaSync, FaGoogle, FaMicrosoft, FaPlus } from "react-icons/fa"
import type { EmailAccount } from "@/types/email"
import { disconnectEmailAccount } from "@/components/email/api"

interface ConnectedEmailAccountsProps {
  accounts: EmailAccount[]
}

export function ConnectedEmailAccounts({ accounts }: ConnectedEmailAccountsProps) {
  const handleDisconnect = async (accountId: string) => {
    try {
      await disconnectEmailAccount(accountId)
      // You might want to update the state or refetch the accounts after disconnecting
    } catch (error) {
      console.error("Failed to disconnect account:", error)
    }
  }

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case "GMAIL":
        return <FaGoogle className="w-6 h-6 text-red-500" />
      case "OUTLOOK":
        return <FaMicrosoft className="w-6 h-6 text-blue-500" />
      default:
        return <FaEnvelope className="w-6 h-6 text-gray-500" />
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-2xl font-bold">Connected Email Accounts</CardTitle>
            <CardDescription>Manage your connected email accounts</CardDescription>
          </div>
          <Button>
            <FaPlus className="mr-2 h-4 w-4" /> Connect New Account
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {accounts.map((account) => (
            <div key={account.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-4">
                {getProviderIcon(account.provider)}
                <div>
                  <h3 className="font-medium">{account.email}</h3>
                  <Badge variant="outline">{account.provider}</Badge>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <FaSync className="h-4 w-4 mr-2" />
                  Sync
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleDisconnect(account.id)}>
                  <FaTrash className="h-4 w-4 mr-2" />
                  Disconnect
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

